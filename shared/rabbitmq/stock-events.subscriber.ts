import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { createHash } from 'crypto';
import { LoggerService, PrismaService } from '../index';

const DEFAULT_STOCK_WRITE_INTERVAL_MS = 1000;

@Injectable()
export class StockEventsSubscriber implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: amqp.Channel | null = null;
  private readonly exchangeName = 'stock.events';
  private readonly queueName = 'stock.bazos-service';
  private readonly stockWriteIntervalMs = this.parseWriteInterval();

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.subscribe();
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await (this.channel as any).close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error: unknown) {
      // Ignore errors during cleanup
    }
  }

  private async connect() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
      this.logger.log(`Connecting to RabbitMQ: ${url}`, 'StockEventsSubscriber');

      const conn = await amqp.connect(url);
      this.connection = conn;
      const ch = await this.connection.createChannel();
      this.channel = ch as unknown as amqp.Channel;

      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.bindQueue(this.queueName, this.exchangeName, 'stock.#');

      this.logger.log('Connected to RabbitMQ and subscribed to stock events', 'StockEventsSubscriber');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to connect to RabbitMQ: ${errorMessage}`, errorStack, 'StockEventsSubscriber');
    }
  }

  private async subscribe() {
    if (!this.channel) return;

    try {
      await this.channel.consume(
        this.queueName,
        async (msg) => {
          if (!msg) return;

          try {
            const event = JSON.parse(msg.content.toString());
            await this.handleStockEvent(event);
            this.channel?.ack(msg);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error processing stock event: ${errorMessage}`, errorStack, 'StockEventsSubscriber');
            this.channel?.nack(msg, false, false);
          }
        },
        { noAck: false },
      );

      this.logger.log('Subscribed to stock events queue', 'StockEventsSubscriber');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to subscribe to stock events: ${errorMessage}`, errorStack, 'StockEventsSubscriber');
    }
  }

  private async handleStockEvent(event: any) {
    const productId = this.normalizeProductId(event?.productId ?? event?.catalogProductId);
    const type = String(event?.type || event?.routingKey || '').trim();

    if (!productId) {
      this.logger.warn('Ignoring Warehouse stock event without productId', {
        type,
        eventId: event?.id || event?.eventId || null,
      });
      return;
    }

    switch (type) {
      case 'stock.updated':
        await this.applyWarehouseStockEvent(event, productId, this.normalizeQuantity(event?.available), 'stock.updated');
        break;
      case 'stock.out':
        await this.applyWarehouseStockEvent(event, productId, 0, 'stock.out');
        break;
      case 'stock.low':
        this.logger.warn(`Low stock alert for product ${productId}: ${event?.available} available`, 'StockEventsSubscriber');
        break;
      default:
        this.logger.warn('Ignoring unsupported Warehouse stock event type', { type, productId });
    }
  }

  private async applyWarehouseStockEvent(event: any, productId: string, targetQuantity: number, eventType: 'stock.updated' | 'stock.out') {
    const eventId = String(event?.id || event?.eventId || this.buildEventId(eventType, productId, targetQuantity));
    const receivedAt = new Date();
    const ads = await this.prisma.bazosAd.findMany({
      where: { productId },
      select: {
        id: true,
        identityId: true,
        bazosAdId: true,
        stockQuantity: true,
        isActive: true,
        publishStatus: true,
        lastPolicyCheck: true,
      },
      orderBy: { updatedAt: 'asc' },
    });

    if (ads.length === 0) {
      this.logger.log(`No Bazos ads found for Warehouse stock event product ${productId}`, 'StockEventsSubscriber');
      return;
    }

    let updated = 0;
    let idempotent = 0;
    let failed = 0;

    for (const [index, ad] of ads.entries()) {
      if (index > 0) await this.delay(this.stockWriteIntervalMs);
      try {
        const existingSync = this.jsonObject((ad.lastPolicyCheck as any)?.warehouseStockSync);
        if (existingSync.eventId === eventId && existingSync.targetQuantity === targetQuantity && existingSync.status === 'applied') {
          idempotent += 1;
          continue;
        }

        const data = this.buildAdStockProjection(ad, eventType, targetQuantity, eventId, receivedAt);
        await this.prisma.bazosAd.update({ where: { id: ad.id }, data });
        updated += 1;
        this.logger.log('Bazos Warehouse stock projection applied', {
          eventType,
          eventId,
          productId,
          adId: ad.id,
          bazosAdId: ad.bazosAdId,
          previousQuantity: ad.stockQuantity,
          targetQuantity,
          publishStatus: data.publishStatus || ad.publishStatus,
          mutatesWarehouse: false,
        });
      } catch (error: unknown) {
        failed += 1;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.recordStockSyncFailure(ad, eventType, eventId, targetQuantity, errorMessage, receivedAt).catch((failureError: any) => {
          this.logger.error('Failed to persist Bazos Warehouse stock failure evidence', failureError?.stack || failureError?.message || String(failureError), 'StockEventsSubscriber');
        });
        this.logger.error('Failed to apply Bazos Warehouse stock projection', error instanceof Error ? error.stack : undefined, {
          eventType,
          eventId,
          productId,
          adId: ad.id,
          targetQuantity,
          error: errorMessage,
          mutatesWarehouse: false,
        } as any);
      }
    }

    this.logger.log('Bazos Warehouse stock event processed', {
      eventType,
      eventId,
      productId,
      targetQuantity,
      ads: ads.length,
      updated,
      idempotent,
      failed,
      pacingRequestsPerSecond: this.stockWriteIntervalMs > 0 ? 1000 / this.stockWriteIntervalMs : 'unlimited-test-only',
      mutatesWarehouse: false,
    });
  }

  private buildAdStockProjection(ad: any, eventType: 'stock.updated' | 'stock.out', targetQuantity: number, eventId: string, receivedAt: Date) {
    const previousStatus = String(ad.publishStatus || 'draft').toLowerCase();
    const current = this.jsonObject(ad.lastPolicyCheck);
    const warehouseStockSync = {
      eventId,
      eventType,
      status: 'applied',
      source: 'warehouse-microservice',
      sourceField: eventType === 'stock.updated' ? 'available' : 'stock.out',
      targetQuantity,
      previousQuantity: Number.isFinite(Number(ad.stockQuantity)) ? Number(ad.stockQuantity) : null,
      previousIsActive: Boolean(ad.isActive),
      previousPublishStatus: ad.publishStatus || null,
      appliedAt: receivedAt.toISOString(),
      mutatesWarehouse: false,
      outboundPacingMs: this.stockWriteIntervalMs,
    };
    const data: any = {
      stockQuantity: targetQuantity,
      lastPolicyCheck: { ...current, warehouseStockSync } as any,
    };

    if (eventType === 'stock.out' || targetQuantity <= 0) {
      data.isActive = false;
      data.publishStatus = 'deleted';
      data.challengeState = null;
      return data;
    }

    data.isActive = true;
    if (previousStatus === 'deleted' && (current as any)?.warehouseStockSync?.eventType === 'stock.out') {
      data.publishStatus = 'draft';
    }
    return data;
  }

  private async recordStockSyncFailure(ad: any, eventType: string, eventId: string, targetQuantity: number, error: string, receivedAt: Date) {
    const current = this.jsonObject(ad.lastPolicyCheck);
    await this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: {
        lastPolicyCheck: {
          ...current,
          warehouseStockSync: {
            eventId,
            eventType,
            status: 'failed',
            source: 'warehouse-microservice',
            targetQuantity,
            previousQuantity: Number.isFinite(Number(ad.stockQuantity)) ? Number(ad.stockQuantity) : null,
            previousIsActive: Boolean(ad.isActive),
            previousPublishStatus: ad.publishStatus || null,
            failedAt: receivedAt.toISOString(),
            error,
            mutatesWarehouse: false,
            outboundPacingMs: this.stockWriteIntervalMs,
          },
        } as any,
      },
    });
  }

  private normalizeProductId(value: unknown): string {
    const productId = String(value || '').trim();
    return productId || '';
  }

  private normalizeQuantity(value: unknown): number {
    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity <= 0) return 0;
    return Math.floor(quantity);
  }

  private buildEventId(eventType: string, productId: string, targetQuantity: number): string {
    return `warehouse-stock-${createHash('sha256').update(`${eventType}:${productId}:${targetQuantity}`).digest('hex').slice(0, 32)}`;
  }

  private jsonObject(value: unknown): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...(value as Record<string, any>) } : {};
  }

  private delay(ms: number): Promise<void> {
    if (!ms || ms <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parseWriteInterval(): number {
    const configured = Number(process.env.BAZOS_STOCK_WRITE_INTERVAL_MS);
    if (Number.isFinite(configured) && configured >= 0) return Math.floor(configured);
    return DEFAULT_STOCK_WRITE_INTERVAL_MS;
  }
}
