import { OrdersService } from './orders.service';

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
  customerEmail: 'customer@example.test',
  customerPhone: '+420777000000',
  total: 1000,
  currency: 'CZK',
  createdAt: new Date('2026-06-26T12:00:00.000Z'),
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
    },
    bazosAd: {
      findFirst: jest.fn().mockResolvedValue(overrides.ad ?? ad),
    },
  } as any;
}

function makeService(
  prisma: any,
  orderClient = { createOrder: jest.fn().mockResolvedValue({ id: 'central-order-1' }) } as any,
) {
  const logger = makeLogger();
  const service = new OrdersService(prisma, orderClient, logger);
  return { service, orderClient, logger };
}

describe('OrdersService', () => {
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

  it('maps Bazos ad item lines to Catalog product IDs before forwarding', async () => {
    const prisma = makePrisma();
    const { service, orderClient } = makeService(prisma);

    const result = await service.create({
      accountId: 'account-1',
      bazosOrderId: 'bazos-order-1',
      total: 1000,
      items: [{ bazosAdId: 'bazos-ad-1', quantity: 2, totalPrice: 2000 }],
    }) as any;

    expect(orderClient.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      externalOrderId: 'bazos-order-1',
      channel: 'bazos',
      items: [{
        productId: ad.productId,
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
