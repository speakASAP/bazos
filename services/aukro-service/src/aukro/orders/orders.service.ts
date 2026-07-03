import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService, OrderClientService } from '@bazos/shared';

export const BAZOS_ORDER_AFFINITY_REPLAY_CONTRACT = 'marketplace.order_affinity_candidate.v1';
const BAZOS_PAID_ORDER_HISTORY_SOURCE_MISSING = '[MISSING: Bazos paid order history source]';
const BAZOS_ORDER_AFFINITY_REPLAY_SOURCE_MISSING = '[MISSING: Bazos persisted order item replay source]';
const BAZOS_ORDER_ITEM_CONTRACT_MISSING = '[MISSING: Bazos order item ingestion contract]';
const BAZOS_ORDER_ITEM_MAPPING_UNAVAILABLE = 'BAZOS_ORDER_ITEM_MAPPING_UNAVAILABLE';
const BAZOS_ORDER_WAREHOUSE_ID_MISSING = '[MISSING: Warehouse-owned warehouseId for Bazos order item]';
const LIVE_BAZOS_WEBHOOK_SUPPORT = '[UNKNOWN: live Bazos marketplace webhook support]';
const CENTRAL_ORDER_UNFORWARDED = 'unforwarded';
const CENTRAL_ORDER_UNKNOWN = 'unknown';
const CENTRAL_ORDER_STALE = 'stale';
const BAZOS_ORDER_READ_ADMIN_ROLES = new Set([
  'global:superadmin',
  'global:platform_admin',
  'app:bazos-service:admin',
  'app:bazos:admin',
  'bazos:admin',
]);

interface SourceOrderLine {
  adId?: string;
  bazosAdId?: string;
  offerId?: string;
  listingId?: string;
  catalogProductId?: string;
  productId?: string;
  warehouseId?: string;
  warehouse?: { id?: string; warehouseId?: string };
  stock?: { warehouseId?: string };
  inventory?: { warehouseId?: string };
  fulfillment?: { warehouseId?: string };
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
  warehouseId: string;
  sku?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

type ItemMappingResult =
  | { available: true; items: CentralOrderItem[] }
  | { available: false; reason: string; missing: string };

interface FindOrdersOptions {
  accountIds?: string[];
  status?: string;
  forwarded?: boolean;
  limit: number;
}

interface OrdersReadActor {
  id?: string | null;
  sub?: string | null;
  userId?: string | null;
  roles?: string[] | null;
}

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

  async findAll(query: any = {}) {
    const accountId = this.cleanIdentifier(query.accountId);
    const orders = await this.findOrders({
      accountIds: accountId ? [accountId] : undefined,
      status: this.cleanIdentifier(query.status),
      forwarded: this.parseOptionalBoolean(query.forwarded),
      limit: this.parseLimit(query.limit),
    });
    return this.attachCentralReadModels(orders, this.shouldIncludeCentralStatus(query));
  }

  async findForUser(userId: string, query: any = {}) {
    const cleanUserId = this.cleanIdentifier(userId);
    if (!cleanUserId) return [];

    const accountIds = await this.accountIdsForUser(cleanUserId);
    const requestedAccountId = this.cleanIdentifier(query.accountId);
    const scopedAccountIds = requestedAccountId
      ? accountIds.filter((accountId) => accountId === requestedAccountId)
      : accountIds;
    if (scopedAccountIds.length === 0) return [];

    const orders = await this.findOrders({
      accountIds: scopedAccountIds,
      status: this.cleanIdentifier(query.status),
      forwarded: this.parseOptionalBoolean(query.forwarded),
      limit: this.parseLimit(query.limit),
    });
    return this.attachCentralReadModels(orders, this.shouldIncludeCentralStatus(query));
  }

  async findVisibleForActor(actor: OrdersReadActor, query: any = {}) {
    if (this.hasOrderReadAdminRole(actor)) {
      return this.findAll(query);
    }
    return this.findForUser(this.actorUserId(actor), query);
  }

  async findOneVisibleForActor(id: string, actor: OrdersReadActor, query: any = {}) {
    if (this.hasOrderReadAdminRole(actor)) {
      return this.findOne(id, query);
    }

    const userId = this.actorUserId(actor);
    if (!userId) return null;
    const accountIds = await this.accountIdsForUser(userId);
    if (accountIds.length === 0) return null;

    const order = await this.prisma.bazosOrder.findFirst({
      where: {
        id,
        accountId: accountIds.length === 1 ? accountIds[0] : { in: accountIds },
      },
      include: { account: { select: { id: true, name: true, email: true, isActive: true, userId: true } } },
    });
    if (!order || !this.shouldIncludeCentralStatus(query)) return order;
    return this.attachCentralReadModel(order);
  }

  async findOne(id: string, query: any = {}) {
    const order = await this.prisma.bazosOrder.findUnique({
      where: { id },
      include: { account: { select: { id: true, name: true, email: true, isActive: true, userId: true } } },
    });
    if (!order || !this.shouldIncludeCentralStatus(query)) return order;
    return this.attachCentralReadModel(order);
  }

  async getOrderAffinityReplayCandidates(query: any = {}) {
    const limit = this.parseLimit(query.limit);
    const from = this.isoOrNull(query.from);
    const to = this.isoOrNull(query.to);
    return {
      sourceOwner: 'bazos-service',
      consumerOwner: 'marketing-microservice',
      contract: BAZOS_ORDER_AFFINITY_REPLAY_CONTRACT,
      channel: 'bazos',
      filters: {
        from,
        to,
        limit,
        cursor: query.cursor || null,
        dryRun: query.dryRun === true || query.dryRun === 'true',
      },
      cursorBefore: query.cursor || null,
      cursorAfter: null,
      count: 0,
      events: [],
      skippedRecords: 0,
      failClosed: true,
      blockers: [
        BAZOS_PAID_ORDER_HISTORY_SOURCE_MISSING,
        BAZOS_ORDER_AFFINITY_REPLAY_SOURCE_MISSING,
        BAZOS_ORDER_ITEM_CONTRACT_MISSING,
      ],
    };
  }

  async create(data: any) {
    const order = await this.prisma.bazosOrder.create({
      data: this.toBazosOrderData(data),
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
      const itemTotal = itemMapping.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const orderTotal = Number(order.total);
      const centralTotal = orderTotal > 0 ? orderTotal : itemTotal;
      const centralOrder = await this.orderClient.createOrder({
        externalOrderId: order.bazosOrderId || order.id,
        channel: 'bazos',
        channelAccountId: order.accountId,
        customer: {
          email: order.customerEmail,
          phone: order.customerPhone,
        },
        items: itemMapping.items,
        subtotal: centralTotal,
        shippingCost: 0,
        taxAmount: 0,
        total: centralTotal,
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
    const payload = data?.order || data?.payload || data;
    const order: any = await this.create(payload);

    return {
      message: 'Synthetic/internal Bazos order ingested',
      liveWebhookSupport: LIVE_BAZOS_WEBHOOK_SUPPORT,
      orderId: order.id,
      forwarding: order.forwarding,
    };
  }

  private actorUserId(actor: OrdersReadActor): string {
    return this.cleanIdentifier(actor?.id || actor?.sub || actor?.userId);
  }

  private hasOrderReadAdminRole(actor: OrdersReadActor): boolean {
    return Array.isArray(actor?.roles) && actor.roles.some((role) => BAZOS_ORDER_READ_ADMIN_ROLES.has(role));
  }

  private async findOrders(options: FindOrdersOptions) {
    if (options.accountIds && options.accountIds.length === 0) return [];
    const where: any = {
      status: options.status,
      forwarded: options.forwarded,
    };
    if (options.accountIds) {
      where.accountId = options.accountIds.length === 1 ? options.accountIds[0] : { in: options.accountIds };
    }

    return this.prisma.bazosOrder.findMany({
      where,
      include: { account: { select: { id: true, name: true, email: true, isActive: true, userId: true } } },
      orderBy: { createdAt: 'desc' },
      take: options.limit,
    });
  }

  private async accountIdsForUser(userId: string): Promise<string[]> {
    const accounts = await this.prisma.bazosAccount.findMany({
      where: {
        OR: [
          { userId },
          { identities: { some: { userId } } },
        ],
      },
      select: { id: true },
    });
    return accounts.map((account: any) => account.id).filter(Boolean);
  }

  private async attachCentralReadModels(orders: any[], includeCentralStatus: boolean) {
    if (!includeCentralStatus) return orders;
    return Promise.all(orders.map((order) => this.attachCentralReadModel(order)));
  }

  private async attachCentralReadModel(order: any) {
    return {
      ...order,
      centralOrder: await this.buildCentralOrderRead(order),
    };
  }

  private async buildCentralOrderRead(order: any) {
    const centralOrderId = this.cleanIdentifier(order?.orderId);
    if (!centralOrderId) {
      const state = order?.forwarded ? CENTRAL_ORDER_UNKNOWN : CENTRAL_ORDER_UNFORWARDED;
      return {
        state,
        orderId: null,
        status: state,
        lifecycleStage: state,
        reason: order?.forwarded
          ? 'Bazos order is marked forwarded but has no stored central Orders id.'
          : 'Bazos order has not been forwarded to central Orders.',
      };
    }

    if (!order?.forwarded) {
      return {
        state: CENTRAL_ORDER_UNFORWARDED,
        orderId: centralOrderId,
        status: CENTRAL_ORDER_UNFORWARDED,
        lifecycleStage: CENTRAL_ORDER_UNFORWARDED,
        reason: 'Bazos order still reports forwarded=false even though a central Orders id is stored.',
      };
    }

    try {
      const central = await this.orderClient.getOrderLifecycleStatus(centralOrderId);
      return {
        state: 'ok',
        ...central,
      };
    } catch (error: any) {
      this.logger.warn(`Central Orders read failed for Bazos order ${order.id}: ${error?.message || String(error)}`);
      return {
        state: CENTRAL_ORDER_STALE,
        orderId: centralOrderId,
        status: CENTRAL_ORDER_STALE,
        lifecycleStage: CENTRAL_ORDER_STALE,
        reason: 'Central Orders read failed for the stored central Orders id; local mapping may be stale.',
      };
    }
  }

  private shouldIncludeCentralStatus(query: any): boolean {
    return this.parseOptionalBoolean(query.centralStatus)
      || this.parseOptionalBoolean(query.includeCentralStatus)
      || this.parseOptionalBoolean(query.central)
      || this.parseOptionalBoolean(query.withCentral)
      || false;
  }

  private isoOrNull(value: unknown): string | null {
    const cleaned = this.cleanIdentifier(value);
    if (!cleaned) return null;
    const parsed = new Date(cleaned);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  private parseOptionalBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') return value;
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
    return undefined;
  }

  private parseLimit(value: unknown): number {
    const parsed = Number(value ?? 25);
    if (!Number.isInteger(parsed) || parsed < 1) return 25;
    return Math.min(parsed, 100);
  }

  private async buildCentralOrderItems(data: any, order: any): Promise<ItemMappingResult> {
    const sourceLines = this.extractSourceLines(data);
    if (sourceLines.length === 0) {
      return this.unavailableItemMapping('missing catalogProductId: no Bazos order item lines were provided');
    }

    const items: CentralOrderItem[] = [];
    for (const line of sourceLines) {
      const ad = await this.findBazosAdForLine(order.accountId, line);
      if (this.hasLineIdentifier(line) && !ad) {
        return this.unavailableItemMapping('missing catalogProductId: Bazos order item line does not identify a known Bazos ad');
      }
      if (ad && !ad.productId) {
        return this.unavailableItemMapping('missing catalogProductId: mapped Bazos ad has no Catalog product ID');
      }

      const productId = this.cleanIdentifier(ad?.productId || line.catalogProductId || line.productId);
      if (!productId) {
        return this.unavailableItemMapping(
          'missing catalogProductId: provide catalogProductId/productId or a Bazos ad/listing reference linked to a Catalog product',
        );
      }

      const warehouseId = this.resolveWarehouseId(line, ad);
      if (!warehouseId) {
        return this.unavailableItemMapping(
          'missing warehouseId: provide Warehouse-owned warehouseId on the Bazos order item or linked ad policy metadata before forwarding to Orders',
          BAZOS_ORDER_WAREHOUSE_ID_MISSING,
        );
      }

      const quantity = this.toPositiveNumber(line.quantity, 1);
      const unitPrice = this.resolveUnitPrice(line, ad, quantity);
      const totalPrice = this.toPositiveNumber(line.totalPrice ?? line.total, unitPrice * quantity);

      items.push({
        productId,
        warehouseId,
        sku: line.sku,
        title: String(line.title || line.name || ad?.title || 'Bazos item'),
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    if (items.length === 0) {
      return this.unavailableItemMapping('missing catalogProductId: no mapped Bazos order items were produced');
    }

    return { available: true, items };
  }

  private toBazosOrderData(data: any) {
    return {
      accountId: data.accountId,
      bazosOrderId: this.cleanIdentifier(data.bazosOrderId ?? data.externalOrderId),
      customerEmail: this.cleanIdentifier(data.customerEmail ?? data.customer?.email),
      customerPhone: this.cleanIdentifier(data.customerPhone ?? data.customer?.phone),
      total: this.resolveOrderTotal(data),
      currency: this.cleanIdentifier(data.currency) || 'CZK',
      status: this.cleanIdentifier(data.status) || 'pending',
    };
  }

  private resolveOrderTotal(data: any): number {
    const explicitTotal = this.toPositiveNumber(data?.total ?? data?.orderTotal ?? data?.subtotal, 0);
    if (explicitTotal > 0) {
      return explicitTotal;
    }

    return this.extractSourceLines(data).reduce((sum, line) => {
      const quantity = this.toPositiveNumber(line.quantity, 1);
      const unitPrice = this.toPositiveNumber(line.unitPrice ?? line.price, 0);
      return sum + this.toPositiveNumber(line.totalPrice ?? line.total, unitPrice * quantity);
    }, 0);
  }

  private extractSourceLines(data: any): SourceOrderLine[] {
    const candidateArrays = [data?.items, data?.orderItems, data?.lines, data?.products];
    const sourceArray = candidateArrays.find((candidate) => Array.isArray(candidate));
    if (sourceArray) {
      return sourceArray.filter((line) => line && typeof line === 'object');
    }

    if (this.hasLineIdentifier(data) || this.hasCatalogProductIdentifier(data)) {
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

  private resolveWarehouseId(line: SourceOrderLine, ad: any): string | undefined {
    const policy = this.jsonObject(ad?.lastPolicyCheck);
    const draftOptions = this.jsonObject(policy.draftOptions);
    const warehouseStock = this.jsonObject(policy.warehouseStock);
    const draftWarehouseStock = this.jsonObject(draftOptions.warehouseStock);
    const warehouseRoute = this.jsonObject(policy.warehouseRoute);
    const candidates = [
      line.warehouseId,
      line.warehouse?.id,
      line.warehouse?.warehouseId,
      line.stock?.warehouseId,
      line.inventory?.warehouseId,
      line.fulfillment?.warehouseId,
      policy.warehouseId,
      this.jsonObject(policy.warehouse).id,
      this.jsonObject(policy.warehouse).warehouseId,
      warehouseStock.warehouseId,
      this.jsonObject(warehouseStock.warehouse).id,
      this.jsonObject(warehouseStock.warehouse).warehouseId,
      draftOptions.warehouseId,
      this.jsonObject(draftOptions.warehouse).id,
      this.jsonObject(draftOptions.warehouse).warehouseId,
      draftWarehouseStock.warehouseId,
      this.jsonObject(draftWarehouseStock.warehouse).id,
      this.jsonObject(draftWarehouseStock.warehouse).warehouseId,
      warehouseRoute.warehouseId,
      this.jsonObject(warehouseRoute.warehouse).id,
      this.jsonObject(warehouseRoute.warehouse).warehouseId,
    ];

    for (const candidate of candidates) {
      const warehouseId = this.cleanIdentifier(candidate);
      if (warehouseId) return warehouseId;
    }

    return undefined;
  }

  private jsonObject(value: unknown): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
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

    return this.toPositiveNumber(ad?.price, 0);
  }

  private hasLineIdentifier(data: SourceOrderLine | undefined): boolean {
    return Boolean(data?.adId || data?.bazosAdId || data?.offerId || data?.listingId);
  }

  private hasCatalogProductIdentifier(data: SourceOrderLine | undefined): boolean {
    return Boolean(data?.catalogProductId || data?.productId);
  }

  private cleanIdentifier(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed || undefined;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
  }

  private toPositiveNumber(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private unavailableItemMapping(reason: string, missing = BAZOS_ORDER_ITEM_CONTRACT_MISSING): ItemMappingResult {
    return {
      available: false,
      reason: `${BAZOS_ORDER_ITEM_MAPPING_UNAVAILABLE}: ${reason}`,
      missing,
    };
  }
}
