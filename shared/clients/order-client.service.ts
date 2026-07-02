import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

const CREATE_ORDER_CONTRACT_VERSION = 'orders.create.v1';
const DEFAULT_CHANNEL_ACCOUNT_ID = 'default';
const DEFAULT_SERVICE_NAME = 'bazos-service';

interface CreateCentralOrderRequest {
  externalOrderId: string;
  channel: string;
  channelAccountId?: string;
  customer?: any;
  shippingAddress?: any;
  billingAddress?: any;
  items: Array<{
    productId: string;
    warehouseId: string;
    sku?: string;
    title: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  currency: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingMethod?: string;
  customerNote?: string;
  orderedAt?: Date;
}

export interface CentralOrderLifecycleStatus {
  orderId: string;
  status: string;
  lifecycleStage: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  deliveryStatus: string;
  updatedAt: string | null;
  orderedAt: string | null;
  source: 'orders.detail';
}

/**
 * API client for orders-microservice.
 * Sends the Orders create contract idempotency fields so callers can retry safely.
 */
@Injectable()
export class OrderClientService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {
    this.baseUrl = process.env.ORDER_SERVICE_URL || 'http://orders-microservice:3203';
  }

  async createOrder(orderData: CreateCentralOrderRequest): Promise<any> {
    const payload = {
      contractVersion: CREATE_ORDER_CONTRACT_VERSION,
      ...orderData,
      channelAccountId: this.normalizeChannelAccountId(orderData.channelAccountId),
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.baseUrl + '/api/orders', payload, this.requestOptions()),
      );
      this.logger.log('Order accepted by orders-microservice: ' + response.data.data?.id, 'OrderClient');
      return response.data.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const message = status === HttpStatus.CONFLICT
        ? 'ORDER_IDEMPOTENCY_CONFLICT'
        : error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Failed to create order in orders-microservice: ' + message, stack, 'OrderClient');
      throw new HttpException('Failed to create order: ' + message, status || HttpStatus.BAD_REQUEST);
    }
  }

  async getOrderLifecycleStatus(orderId: string): Promise<CentralOrderLifecycleStatus> {
    const cleanOrderId = this.normalizeIdentifier(orderId);
    if (!cleanOrderId) {
      throw new HttpException('Central order id is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl + '/api/orders/' + encodeURIComponent(cleanOrderId), this.requestOptions()),
      );
      return this.toLifecycleStatus(response.data.data || response.data);
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to read order lifecycle status: ' + message, 'OrderClient');
      throw new HttpException('Failed to read order lifecycle status: ' + message, status || HttpStatus.BAD_REQUEST);
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.put(this.baseUrl + '/api/orders/' + orderId + '/status', { status }, this.requestOptions()),
      );
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Failed to update order status: ' + errorMessage, errorStack, 'OrderClient');
      throw new HttpException('Failed to update order status: ' + errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async findByExternalId(externalOrderId: string, channel: string, channelAccountId?: string): Promise<any | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl + '/api/orders', {
          ...this.requestOptions(),
          params: {
            channel,
            externalOrderId,
            channelAccountId: channelAccountId ? this.normalizeChannelAccountId(channelAccountId) : undefined,
          },
        }),
      );
      const orders = response.data.data || [];
      return orders.find((order: any) => order.externalOrderId === externalOrderId) || null;
    } catch (error: unknown) {
      this.logger.warn('Order not found: ' + externalOrderId, 'OrderClient');
      return null;
    }
  }

  private toLifecycleStatus(order: any): CentralOrderLifecycleStatus {
    const lifecycle = this.objectValue(order?.lifecycle);
    const derived = Object.keys(lifecycle).length ? lifecycle : this.deriveLifecycle(order || {});

    return {
      orderId: this.normalizeIdentifier(order?.id) || 'unknown',
      status: this.normalizeStatus(order?.status || derived.status, 'unknown'),
      lifecycleStage: this.normalizeStatus(derived.lifecycleStage, 'unknown'),
      paymentStatus: this.normalizeStatus(order?.paymentStatus || derived.paymentStatus, 'unpaid'),
      fulfillmentStatus: this.normalizeStatus(derived.fulfillmentStatus, 'not_requested'),
      deliveryStatus: this.normalizeStatus(derived.deliveryStatus, 'not_started'),
      updatedAt: this.toIso(order?.updatedAt),
      orderedAt: this.toIso(order?.orderedAt || order?.createdAt),
      source: 'orders.detail',
    };
  }

  private deriveLifecycle(order: any) {
    const status = this.normalizeStatus(order?.status, 'pending');
    const paymentStatus = this.normalizeStatus(order?.paymentStatus, 'unpaid');
    const warehouseStatus = this.normalizeStatus(order?.warehouseHandoff?.status, 'not_requested');
    const itemStatuses = Array.isArray(order?.items)
      ? order.items.map((item: any) => this.normalizeStatus(item?.fulfillmentStatus, 'pending'))
      : [];
    const allItemsShipped = itemStatuses.length > 0 && itemStatuses.every((value) => value === 'shipped' || value === 'delivered');
    const allItemsDelivered = itemStatuses.length > 0 && itemStatuses.every((value) => value === 'delivered');

    let lifecycleStage = 'ordered_unpaid';
    if (status === 'cancelled' || warehouseStatus === 'cancelled') {
      lifecycleStage = 'cancelled';
    } else if (warehouseStatus === 'returned') {
      lifecycleStage = 'returned';
    } else if (status === 'delivered' || allItemsDelivered) {
      lifecycleStage = 'received';
    } else if (status === 'shipped' || allItemsShipped) {
      lifecycleStage = 'handed_to_delivery';
    } else if ((paymentStatus === 'failed' || paymentStatus === 'cancelled') && status !== 'cancelled' && status !== 'delivered') {
      lifecycleStage = 'payment_failed';
    } else if (paymentStatus === 'paid') {
      lifecycleStage = status === 'processing'
        ? 'warehouse_collecting'
        : warehouseStatus === 'fulfilled'
          ? 'warehouse_fulfillment_requested'
          : 'paid_not_delivered';
    }

    return {
      lifecycleStage,
      status,
      paymentStatus,
      fulfillmentStatus: this.deriveFulfillmentStatus(lifecycleStage, warehouseStatus, itemStatuses),
      deliveryStatus: this.deriveDeliveryStatus(lifecycleStage),
    };
  }

  private deriveFulfillmentStatus(lifecycleStage: string, warehouseStatus: string, itemStatuses: string[]): string {
    if (lifecycleStage === 'warehouse_fulfillment_requested') return 'fulfillment_requested';
    if (lifecycleStage === 'warehouse_collecting') return 'collecting';
    if (lifecycleStage === 'warehouse_forming') return 'forming';
    if (lifecycleStage === 'warehouse_formed') return 'formed';
    if (lifecycleStage === 'handed_to_delivery' || lifecycleStage === 'in_delivery' || lifecycleStage === 'received') return 'fulfilled';
    if (lifecycleStage === 'returned') return 'returned';
    if (lifecycleStage === 'cancelled') return 'cancelled';
    if (warehouseStatus === 'reserved') return 'reserved_waiting_for_payment';
    if (itemStatuses.length && itemStatuses.every((value) => value === 'reserved')) return 'reserved_waiting_for_payment';
    return 'not_requested';
  }

  private deriveDeliveryStatus(lifecycleStage: string): string {
    if (lifecycleStage === 'handed_to_delivery') return 'handed_to_delivery';
    if (lifecycleStage === 'in_delivery') return 'in_delivery';
    if (lifecycleStage === 'received') return 'received';
    if (lifecycleStage === 'not_received') return 'not_received';
    if (lifecycleStage === 'returned') return 'returned';
    return 'not_started';
  }

  private objectValue(value: unknown): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
  }

  private normalizeStatus(value: unknown, fallback: string): string {
    const normalized = this.normalizeIdentifier(value)?.toLowerCase();
    return normalized || fallback;
  }

  private normalizeIdentifier(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    return normalized || undefined;
  }

  private toIso(value: unknown): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.valueOf()) ? null : date.toISOString();
  }

  private requestOptions() {
    const serviceName = (process.env.ORDER_SERVICE_NAME || process.env.SERVICE_NAME || DEFAULT_SERVICE_NAME).trim() || DEFAULT_SERVICE_NAME;
    const internalToken = (
      process.env.BAZOS_INTERNAL_SERVICE_TOKEN ||
      process.env.ORDERS_INTERNAL_SERVICE_TOKEN ||
      process.env.ORDER_SERVICE_INTERNAL_TOKEN ||
      process.env.JWT_TOKEN ||
      process.env.SERVICE_TOKEN ||
      ''
    ).trim();
    const headers: Record<string, string> = {
      'x-service-name': serviceName,
    };

    if (internalToken) {
      headers['x-internal-service-token'] = internalToken;
    }

    return { headers };
  }

  private normalizeChannelAccountId(channelAccountId?: string): string {
    const normalized = channelAccountId?.trim();
    return normalized || DEFAULT_CHANNEL_ACCOUNT_ID;
  }
}
