import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService, OrderClientService } from '@bazos/shared';

const BAZOS_ORDER_ITEM_CONTRACT_MISSING = '[MISSING: Bazos order item ingestion contract]';
const BAZOS_ORDER_ITEM_MAPPING_UNAVAILABLE = 'BAZOS_ORDER_ITEM_MAPPING_UNAVAILABLE';

interface SourceOrderLine {
  adId?: string;
  bazosAdId?: string;
  offerId?: string;
  listingId?: string;
  title?: string;
  name?: string;
  sku?: string;
  quantity?: unknown;
  unitPrice?: unknown;
  price?: unknown;
  totalPrice?: unknown;
  total?: unknown;
}

interface CentralOrderItem {
  productId: string;
  sku?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

type ItemMappingResult =
  | { available: true; items: CentralOrderItem[] }
  | { available: false; reason: string; missing: string };

@Injectable()
export class OrdersService {
  private readonly logger: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderClient: OrderClientService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('OrdersService');
  }

  async findAll(query: any) {
    return this.prisma.bazosOrder.findMany({
      where: {
        accountId: query.accountId,
        status: query.status,
        forwarded: query.forwarded !== undefined ? query.forwarded === 'true' : undefined,
      },
      include: {
        account: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.bazosOrder.findUnique({
      where: { id },
      include: { account: true },
    });
  }

  async create(data: any) {
    const order = await this.prisma.bazosOrder.create({
      data,
    });

    const itemMapping = await this.buildCentralOrderItems(data, order);
    if (itemMapping.available === false) {
      this.logger.warn(`Order ${order.id} not forwarded to orders-microservice: ${itemMapping.reason}`);
      return {
        ...order,
        forwarding: {
          forwarded: false,
          available: false,
          reason: itemMapping.reason,
          missing: itemMapping.missing,
        },
      };
    }

    try {
      const centralOrder = await this.orderClient.createOrder({
        externalOrderId: order.bazosOrderId || order.id,
        channel: 'bazos',
        channelAccountId: order.accountId,
        customer: {
          email: order.customerEmail,
          phone: order.customerPhone,
        },
        items: itemMapping.items,
        subtotal: Number(order.total),
        shippingCost: 0,
        taxAmount: 0,
        total: Number(order.total),
        currency: order.currency,
        orderedAt: order.createdAt,
      });

      const updatedOrder = await this.prisma.bazosOrder.update({
        where: { id: order.id },
        data: {
          orderId: centralOrder.id,
          forwarded: true,
        },
      });

      this.logger.log(`Order ${order.id} forwarded to orders-microservice: ${centralOrder.id}`);
      return {
        ...updatedOrder,
        forwarding: {
          forwarded: true,
          orderId: centralOrder.id,
          itemCount: itemMapping.items.length,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to forward order to orders-microservice: ${error.message}`);
      return order;
    }
  }

  async handleWebhook(data: any) {
    this.logger.warn(`Webhook handler unavailable: ${BAZOS_ORDER_ITEM_CONTRACT_MISSING}`);
    return {
      available: false,
      reason: BAZOS_ORDER_ITEM_MAPPING_UNAVAILABLE,
      missing: BAZOS_ORDER_ITEM_CONTRACT_MISSING,
      received: Boolean(data),
    };
  }

  private async buildCentralOrderItems(data: any, order: any): Promise<ItemMappingResult> {
    const sourceLines = this.extractSourceLines(data);
    if (sourceLines.length === 0) {
      return this.unavailableItemMapping('No Bazos order item lines were provided');
    }

    const items: CentralOrderItem[] = [];
    for (const line of sourceLines) {
      const ad = await this.findBazosAdForLine(order.accountId, line);
      if (!ad) {
        return this.unavailableItemMapping('Bazos order item line does not identify a known Bazos ad');
      }
      if (!ad.productId) {
        return this.unavailableItemMapping('Mapped Bazos ad has no Catalog product ID');
      }

      const quantity = this.toPositiveNumber(line.quantity, 1);
      const unitPrice = this.resolveUnitPrice(line, ad, quantity);
      const totalPrice = this.toPositiveNumber(line.totalPrice ?? line.total, unitPrice * quantity);

      items.push({
        productId: ad.productId,
        sku: line.sku,
        title: String(line.title || line.name || ad.title),
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    if (items.length === 0) {
      return this.unavailableItemMapping('No mapped Bazos order items were produced');
    }

    return { available: true, items };
  }

  private extractSourceLines(data: any): SourceOrderLine[] {
    const candidateArrays = [data?.items, data?.orderItems, data?.lines, data?.products];
    const sourceArray = candidateArrays.find((candidate) => Array.isArray(candidate));
    if (sourceArray) {
      return sourceArray.filter((line) => line && typeof line === 'object');
    }

    if (this.hasLineIdentifier(data)) {
      return [data];
    }

    return [];
  }

  private async findBazosAdForLine(accountId: string, line: SourceOrderLine): Promise<any | null> {
    const rawAdId = this.cleanIdentifier(line.adId);
    const rawBazosAdId = this.cleanIdentifier(line.bazosAdId || line.offerId || line.listingId);
    const selectors: any[] = [];

    if (rawAdId && this.isUuid(rawAdId)) {
      selectors.push({ id: rawAdId, accountId });
    } else if (rawAdId) {
      selectors.push({ bazosAdId: rawAdId, accountId });
    }

    if (rawBazosAdId) {
      selectors.push({ bazosAdId: rawBazosAdId, accountId });
    }

    if (selectors.length === 0) {
      return null;
    }

    return this.prisma.bazosAd.findFirst({ where: { OR: selectors } });
  }

  private resolveUnitPrice(line: SourceOrderLine, ad: any, quantity: number): number {
    const explicitUnitPrice = this.toPositiveNumber(line.unitPrice ?? line.price, 0);
    if (explicitUnitPrice > 0) {
      return explicitUnitPrice;
    }

    const total = this.toPositiveNumber(line.totalPrice ?? line.total, 0);
    if (total > 0 && quantity > 0) {
      return total / quantity;
    }

    return this.toPositiveNumber(ad.price, 0);
  }

  private hasLineIdentifier(data: SourceOrderLine | undefined): boolean {
    return Boolean(data?.adId || data?.bazosAdId || data?.offerId || data?.listingId);
  }

  private cleanIdentifier(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private toPositiveNumber(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private unavailableItemMapping(reason: string): ItemMappingResult {
    return {
      available: false,
      reason: `${BAZOS_ORDER_ITEM_MAPPING_UNAVAILABLE}: ${reason}`,
      missing: BAZOS_ORDER_ITEM_CONTRACT_MISSING,
    };
  }
}
