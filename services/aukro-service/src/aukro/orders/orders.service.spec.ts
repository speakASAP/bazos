import { UnauthorizedException } from '@nestjs/common';
import { InternalOrderAffinityController } from './orders.controller';
import { BAZOS_ORDER_AFFINITY_REPLAY_CONTRACT, OrdersService } from './orders.service';

function makeLogger() {
  return {
    setContext: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;
}

const order = {
  id: 'order-1',
  accountId: 'account-1',
  bazosOrderId: 'bazos-order-1',
  orderId: null,
  customerEmail: 'customer@example.test',
  customerPhone: '+420777000000',
  total: 1000,
  currency: 'CZK',
  status: 'pending',
  forwarded: false,
  createdAt: new Date('2026-06-26T12:00:00.000Z'),
  updatedAt: new Date('2026-06-26T12:00:00.000Z'),
};

const ad = {
  id: '11111111-1111-4111-8111-111111111111',
  accountId: 'account-1',
  bazosAdId: 'bazos-ad-1',
  productId: '22222222-2222-4222-8222-222222222222',
  title: 'Catalog product ad',
  price: 1000,
};

function makePrisma(overrides: Partial<Record<string, any>> = {}) {
  return {
    bazosOrder: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...order, ...data })),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...order, ...data })),
      findMany: jest.fn().mockResolvedValue(overrides.orders ?? []),
      findUnique: jest.fn().mockResolvedValue(overrides.order ?? order),
    },
    bazosAccount: {
      findMany: jest.fn().mockResolvedValue(overrides.accounts ?? [{ id: 'account-1' }]),
    },
    bazosAd: {
      findFirst: jest.fn().mockResolvedValue(overrides.ad ?? ad),
    },
  } as any;
}

function makeService(
  prisma: any,
  orderClient = {
    createOrder: jest.fn().mockResolvedValue({ id: 'central-order-1' }),
    getOrderLifecycleStatus: jest.fn().mockResolvedValue({
      orderId: 'central-order-1',
      status: 'processing',
      lifecycleStage: 'warehouse_collecting',
      paymentStatus: 'paid',
      fulfillmentStatus: 'collecting',
      deliveryStatus: 'not_started',
      updatedAt: '2026-07-02T10:00:00.000Z',
      orderedAt: '2026-07-02T09:00:00.000Z',
      source: 'orders.detail',
    }),
  } as any,
) {
  const logger = makeLogger();
  const service = new OrdersService(prisma, orderClient, logger);
  return { service, orderClient, logger };
}

describe('OrdersService', () => {
  it('returns user-scoped orders with central Orders lifecycle status', async () => {
    const prisma = makePrisma({
      accounts: [{ id: 'account-1' }],
      orders: [{ ...order, forwarded: true, orderId: 'central-order-1' }],
    });
    const { service, orderClient } = makeService(prisma);

    const result = await service.findForUser('user-1', { centralStatus: 'true' }) as any[];

    expect(prisma.bazosAccount.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { OR: [{ userId: 'user-1' }, { identities: { some: { userId: 'user-1' } } }] },
    }));
    expect(orderClient.getOrderLifecycleStatus).toHaveBeenCalledWith('central-order-1');
    expect(result[0].centralOrder).toEqual(expect.objectContaining({
      state: 'ok',
      orderId: 'central-order-1',
      lifecycleStage: 'warehouse_collecting',
    }));
  });

  it('scopes order detail reads to the authenticated Bazos account owner', async () => {
    const prisma = makePrisma({
      accounts: [{ id: 'account-1' }],
      order: { ...order, forwarded: true, orderId: 'central-order-1' },
    });
    prisma.bazosOrder.findFirst = jest.fn().mockResolvedValue({ ...order, forwarded: true, orderId: 'central-order-1' });
    const { service, orderClient } = makeService(prisma);

    const result = await service.findOneVisibleForActor('order-1', { id: 'user-1', roles: [] }, { centralStatus: 'true' }) as any;

    expect(prisma.bazosOrder.findUnique).not.toHaveBeenCalled();
    expect(prisma.bazosOrder.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'order-1', accountId: 'account-1' },
    }));
    expect(orderClient.getOrderLifecycleStatus).toHaveBeenCalledWith('central-order-1');
    expect(result.centralOrder.state).toBe('ok');
  });

  it('leaves admin order reads unscoped', async () => {
    const prisma = makePrisma({ orders: [{ ...order }] });
    const { service } = makeService(prisma);

    await service.findVisibleForActor({ id: 'admin-1', roles: ['app:bazos-service:admin'] }, { status: 'pending' });

    expect(prisma.bazosAccount.findMany).not.toHaveBeenCalled();
    expect(prisma.bazosOrder.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'pending', forwarded: undefined },
    }));
  });

  it('marks local orders without central ids as unforwarded in the read model', async () => {
    const prisma = makePrisma({ orders: [{ ...order, forwarded: false, orderId: null }] });
    const { service, orderClient } = makeService(prisma);

    const result = await service.findForUser('user-1', { centralStatus: 'true' }) as any[];

    expect(orderClient.getOrderLifecycleStatus).not.toHaveBeenCalled();
    expect(result[0].centralOrder).toEqual(expect.objectContaining({
      state: 'unforwarded',
      status: 'unforwarded',
      lifecycleStage: 'unforwarded',
    }));
  });

  it('marks stored central ids as stale when Orders read fails', async () => {
    const prisma = makePrisma({ orders: [{ ...order, forwarded: true, orderId: 'central-order-1' }] });
    const { service, orderClient } = makeService(prisma, {
      createOrder: jest.fn(),
      getOrderLifecycleStatus: jest.fn().mockRejectedValue(new Error('orders unavailable')),
    } as any);

    const result = await service.findForUser('user-1', { centralStatus: 'true' }) as any[];

    expect(orderClient.getOrderLifecycleStatus).toHaveBeenCalledWith('central-order-1');
    expect(result[0].centralOrder).toEqual(expect.objectContaining({
      state: 'stale',
      orderId: 'central-order-1',
      status: 'stale',
      lifecycleStage: 'stale',
    }));
  });

  it('requires Marketing service auth on the internal replay controller', async () => {
    const prisma = makePrisma();
    const { service } = makeService(prisma);
    const config = {
      get: jest.fn((key: string) => key === 'BAZOS_INTERNAL_SERVICE_TOKEN' ? 'bazos-replay-token' : undefined),
    } as any;
    const controller = new InternalOrderAffinityController(service, config);

    await expect(controller.getReplayCandidates({ limit: '10' }, 'wrong-token', 'marketing-microservice'))
      .rejects.toBeInstanceOf(UnauthorizedException);
    await expect(controller.getReplayCandidates({ limit: '10' }, 'bazos-replay-token', 'other-service'))
      .rejects.toBeInstanceOf(UnauthorizedException);

    const response = await controller.getReplayCandidates({ limit: '10', dryRun: 'true' }, 'Bearer bazos-replay-token', 'marketing-microservice');

    expect(response.success).toBe(true);
    expect(response.data).toEqual(expect.objectContaining({
      sourceOwner: 'bazos-service',
      consumerOwner: 'marketing-microservice',
      contract: BAZOS_ORDER_AFFINITY_REPLAY_CONTRACT,
      channel: 'bazos',
      count: 0,
      events: [],
      failClosed: true,
    }));
    expect(response.data.blockers).toContain('[MISSING: Bazos paid order history source]');
    expect(response.data.blockers).toContain('[MISSING: Bazos persisted order item replay source]');
    expect(response.data.blockers).toContain('[MISSING: Bazos order item ingestion contract]');
  });

  it('returns a protected replay contract that fails closed when no persisted item source exists', async () => {
    const prisma = makePrisma();
    const { service } = makeService(prisma);

    const result = await service.getOrderAffinityReplayCandidates({ limit: 10, dryRun: 'true', from: '2026-07-01T00:00:00.000Z' });

    expect(result).toEqual(expect.objectContaining({
      sourceOwner: 'bazos-service',
      consumerOwner: 'marketing-microservice',
      contract: BAZOS_ORDER_AFFINITY_REPLAY_CONTRACT,
      channel: 'bazos',
      count: 0,
      events: [],
      failClosed: true,
    }));
    expect(result.blockers).toContain('[MISSING: Bazos paid order history source]');
    expect(result.blockers).toContain('[MISSING: Bazos persisted order item replay source]');
    expect(result.blockers).toContain('[MISSING: Bazos order item ingestion contract]');
    expect(JSON.stringify(result)).not.toContain('customer@example.test');
  });

  it('does not forward when the order has no item/ad line contract', async () => {
    const prisma = makePrisma();
    const { service, orderClient } = makeService(prisma);

    const result = await service.create({ accountId: 'account-1', bazosOrderId: 'bazos-order-1' }) as any;

    expect(orderClient.createOrder).not.toHaveBeenCalled();
    expect(prisma.bazosOrder.update).not.toHaveBeenCalled();
    expect(result.forwarding).toEqual(expect.objectContaining({
      forwarded: false,
      available: false,
      missing: '[MISSING: Bazos order item ingestion contract]',
    }));
  });

  it('does not forward when the Bazos ad line has no Catalog product ID', async () => {
    const prisma = makePrisma({ ad: { ...ad, productId: null } });
    const { service, orderClient } = makeService(prisma);

    const result = await service.create({
      accountId: 'account-1',
      items: [{ bazosAdId: 'bazos-ad-1', quantity: 1 }],
    }) as any;

    expect(orderClient.createOrder).not.toHaveBeenCalled();
    expect(prisma.bazosOrder.update).not.toHaveBeenCalled();
    expect(result.forwarding.reason).toContain('mapped Bazos ad has no Catalog product ID');
  });

  it('does not forward when the mapped item has no Warehouse-owned warehouseId', async () => {
    const prisma = makePrisma();
    const { service, orderClient } = makeService(prisma);

    const result = await service.create({
      accountId: 'account-1',
      items: [{ bazosAdId: 'bazos-ad-1', quantity: 1 }],
    }) as any;

    expect(orderClient.createOrder).not.toHaveBeenCalled();
    expect(prisma.bazosOrder.update).not.toHaveBeenCalled();
    expect(result.forwarding).toEqual(expect.objectContaining({
      forwarded: false,
      available: false,
      missing: '[MISSING: Warehouse-owned warehouseId for Bazos order item]',
    }));
    expect(result.forwarding.reason).toContain('missing warehouseId');
  });

  it('maps Bazos ad policy metadata warehouseId when the source line omits it', async () => {
    const prisma = makePrisma({
      ad: {
        ...ad,
        lastPolicyCheck: { draftOptions: { warehouseStock: { warehouseId: 'warehouse-from-policy' } } },
      },
    });
    const { service, orderClient } = makeService(prisma);

    await service.create({
      accountId: 'account-1',
      bazosOrderId: 'bazos-order-1',
      items: [{ bazosAdId: 'bazos-ad-1', quantity: 1, totalPrice: 1000 }],
    }) as any;

    expect(orderClient.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      items: [expect.objectContaining({
        productId: ad.productId,
        warehouseId: 'warehouse-from-policy',
      })],
    }));
  });

  it('maps Bazos ad item lines to Catalog product IDs before forwarding', async () => {
    const prisma = makePrisma();
    const { service, orderClient } = makeService(prisma);

    const result = await service.create({
      accountId: 'account-1',
      bazosOrderId: 'bazos-order-1',
      total: 1000,
      items: [{ bazosAdId: 'bazos-ad-1', warehouseId: 'warehouse-1', quantity: 2, totalPrice: 2000 }],
    }) as any;

    expect(orderClient.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      externalOrderId: 'bazos-order-1',
      channel: 'bazos',
      items: [{
        productId: ad.productId,
        warehouseId: 'warehouse-1',
        sku: undefined,
        title: ad.title,
        quantity: 2,
        unitPrice: 1000,
        totalPrice: 2000,
      }],
      subtotal: 1000,
      total: 1000,
    }));
    expect(prisma.bazosOrder.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: order.id },
      data: { orderId: 'central-order-1', forwarded: true },
    }));
    expect(result.forwarding).toEqual({ forwarded: true, orderId: 'central-order-1', itemCount: 1 });
  });

  it('forwards synthetic internal item payloads that already carry Catalog product IDs', async () => {
    const prisma = makePrisma({ ad: null });
    const { service, orderClient } = makeService(prisma);

    const result = await service.create({
      accountId: 'account-1',
      bazosOrderId: 'synthetic-bazos-1',
      items: [{
        catalogProductId: '33333333-3333-4333-8333-333333333333',
        warehouseId: 'warehouse-1',
        title: 'Synthetic Bazos item',
        quantity: 3,
        unitPrice: 250,
      }],
    }) as any;

    expect(orderClient.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      externalOrderId: 'synthetic-bazos-1',
      channel: 'bazos',
      items: [{
        productId: '33333333-3333-4333-8333-333333333333',
        warehouseId: 'warehouse-1',
        sku: undefined,
        title: 'Synthetic Bazos item',
        quantity: 3,
        unitPrice: 250,
        totalPrice: 750,
      }],
      subtotal: 750,
      total: 750,
    }));
    expect(result.forwarding).toEqual({ forwarded: true, orderId: 'central-order-1', itemCount: 1 });
  });

  it('ingests synthetic/internal webhook envelopes while keeping live Bazos webhook support unknown', async () => {
    const prisma = makePrisma({ ad: null });
    const { service, orderClient } = makeService(prisma);

    const result = await service.handleWebhook({
      payload: {
        accountId: 'account-1',
        externalOrderId: 'webhook-synthetic-1',
        items: [{
          productId: '44444444-4444-4444-8444-444444444444',
          warehouseId: 'warehouse-1',
          quantity: 1,
          price: 499,
        }],
      },
    });

    expect(orderClient.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      externalOrderId: 'webhook-synthetic-1',
      channel: 'bazos',
      items: [expect.objectContaining({
        productId: '44444444-4444-4444-8444-444444444444',
        warehouseId: 'warehouse-1',
        quantity: 1,
        unitPrice: 499,
        totalPrice: 499,
      })],
    }));
    expect(result).toEqual(expect.objectContaining({
      message: 'Synthetic/internal Bazos order ingested',
      liveWebhookSupport: '[UNKNOWN: live Bazos marketplace webhook support]',
      forwarding: { forwarded: true, orderId: 'central-order-1', itemCount: 1 },
    }));
  });
});
