import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { CatalogClientService, LoggerService, PrismaService, WarehouseClientService } from '../../index';

const BAZOS_EXTERNAL_DELISTING_BLOCKER = '[MISSING: approved Bazos external delete/de-list capability]';
const SAFE_REFRESH_BLOCKER = '[MISSING: safe catalog-event refresh policy]';

export type BazosAvailabilityReconciliationReason =
  | 'catalog_product_missing'
  | 'catalog_product_archived'
  | 'catalog_product_deleted'
  | 'catalog_product_inactive'
  | 'catalog_product_not_sellable'
  | 'warehouse_stock_unavailable';

export interface BazosAvailabilityReconciliationOptions {
  limit?: number;
  dryRun?: boolean;
  now?: Date;
}

export interface BazosAvailabilityReconciliationResult {
  scanned: number;
  disabled: number;
  kept: number;
  failed: number;
  dryRun: boolean;
  blocker: string;
  failures: Array<{ adId: string; productId: string; error: string }>;
}

@Injectable()
export class BazosAvailabilityReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogClient: CatalogClientService,
    private readonly warehouseClient: WarehouseClientService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('BazosAvailabilityReconciliationService');
  }

  async reconcile(options: BazosAvailabilityReconciliationOptions = {}): Promise<BazosAvailabilityReconciliationResult> {
    const limit = this.limit(options.limit);
    const dryRun = Boolean(options.dryRun);
    const checkedAt = options.now || new Date();
    const ads = await this.prisma.bazosAd.findMany({
      where: {
        productId: { not: null },
        OR: [
          { isActive: true },
          { stockQuantity: { gt: 0 } },
          { publishStatus: { in: ['active', 'published', 'publishing', 'queued'] } },
        ],
      },
      select: {
        id: true,
        productId: true,
        bazosAdId: true,
        stockQuantity: true,
        isActive: true,
        publishStatus: true,
        challengeState: true,
        lastPolicyCheck: true,
      },
      orderBy: { updatedAt: 'asc' },
      take: limit,
    });

    const result: BazosAvailabilityReconciliationResult = {
      scanned: ads.length,
      disabled: 0,
      kept: 0,
      failed: 0,
      dryRun,
      blocker: SAFE_REFRESH_BLOCKER,
      failures: [],
    };

    for (const ad of ads) {
      const productId = this.normalizeProductId(ad.productId);
      if (!productId) {
        result.kept += 1;
        continue;
      }

      try {
        const decision = await this.evaluate(productId);
        if (!decision.reason) {
          result.kept += 1;
          continue;
        }

        if (!dryRun) {
          await this.disableAd(ad, decision.reason, decision, checkedAt);
        }
        result.disabled += 1;
      } catch (error: any) {
        result.failed += 1;
        result.failures.push({
          adId: ad.id,
          productId,
          error: error?.message || String(error),
        });
        this.logger.warn('Bazos availability reconciliation failed for ad', {
          adId: ad.id,
          productId,
          error: error?.message || String(error),
        });
      }
    }

    this.logger.log('Bazos availability reconciliation completed', result);
    return result;
  }

  private async evaluate(productId: string): Promise<{
    reason: BazosAvailabilityReconciliationReason | null;
    catalogProduct: any | null;
    warehouseAvailable: number;
  }> {
    const catalogProduct = await this.getCatalogProduct(productId);
    const catalogReason = this.catalogNonSellableReason(catalogProduct);
    if (catalogReason) {
      return { reason: catalogReason, catalogProduct, warehouseAvailable: 0 };
    }

    const warehouseAvailable = Number(await this.warehouseClient.getTotalAvailable(productId));
    if (!Number.isFinite(warehouseAvailable) || warehouseAvailable <= 0) {
      return { reason: 'warehouse_stock_unavailable', catalogProduct, warehouseAvailable: 0 };
    }

    return { reason: null, catalogProduct, warehouseAvailable };
  }

  private async getCatalogProduct(productId: string): Promise<any | null> {
    try {
      return await this.catalogClient.getProductById(productId);
    } catch (error: any) {
      this.logger.warn('Bazos availability reconciliation treating Catalog lookup failure as non-sellable', {
        productId,
        error: error?.message || String(error),
      });
      return null;
    }
  }

  private catalogNonSellableReason(product: any | null): BazosAvailabilityReconciliationReason | null {
    if (!product) return 'catalog_product_missing';
    const status = String(product.status || product.lifecycleStatus || product.state || '').trim().toLowerCase();
    if (status === 'deleted') return 'catalog_product_deleted';
    if (status === 'archived') return 'catalog_product_archived';
    if (status === 'inactive') return 'catalog_product_inactive';
    if (this.booleanFalse(product.isActive ?? product.active)) return 'catalog_product_inactive';
    if (this.booleanFalse(product.isSellable ?? product.sellable ?? product.offerable ?? product.isOfferable)) {
      return 'catalog_product_not_sellable';
    }
    return null;
  }

  private async disableAd(ad: any, reason: BazosAvailabilityReconciliationReason, decision: { warehouseAvailable: number }, checkedAt: Date) {
    const current = this.jsonObject(ad.lastPolicyCheck);
    const reconciliationId = this.reconciliationId(ad.id, ad.productId, reason);
    await this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: {
        stockQuantity: 0,
        isActive: false,
        publishStatus: 'deleted',
        challengeState: null,
        lastPolicyCheck: {
          ...current,
          availabilityReconciliation: {
            reconciliationId,
            status: 'applied',
            reason,
            source: 'manual_reconciliation',
            catalogProductId: this.normalizeProductId(ad.productId),
            warehouseAvailable: Number.isFinite(Number(decision.warehouseAvailable)) ? Number(decision.warehouseAvailable) : 0,
            previousQuantity: Number.isFinite(Number(ad.stockQuantity)) ? Number(ad.stockQuantity) : null,
            previousIsActive: Boolean(ad.isActive),
            previousPublishStatus: ad.publishStatus || null,
            previousChallengeState: ad.challengeState || null,
            appliedAt: checkedAt.toISOString(),
            externalAction: 'not_attempted',
            externalBlocker: BAZOS_EXTERNAL_DELISTING_BLOCKER,
            positiveRefreshBlocker: SAFE_REFRESH_BLOCKER,
          },
        } as any,
      },
    });
  }

  private reconciliationId(adId: string, productId: string, reason: string): string {
    return `bazos-availability-${createHash('sha256').update(`${adId}:${productId}:${reason}:v1`).digest('hex').slice(0, 32)}`;
  }

  private normalizeProductId(value: unknown): string {
    const productId = String(value || '').trim();
    return productId || '';
  }

  private booleanFalse(value: unknown): boolean {
    if (value === false || value === 0) return true;
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized === 'false' || normalized === '0' || normalized === 'no';
  }

  private jsonObject(value: unknown): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...(value as Record<string, any>) } : {};
  }

  private limit(value: unknown): number {
    const parsed = Number(value || process.env.BAZOS_AVAILABILITY_RECONCILIATION_LIMIT || 200);
    if (!Number.isFinite(parsed)) return 200;
    return Math.max(1, Math.min(Math.floor(parsed), 1000));
  }
}
