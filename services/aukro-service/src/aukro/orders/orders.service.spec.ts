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
      create: jest.fn().mockResolvedValue(overrides.order ?? order),
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
    expect(result.forwarding.reason).toContain('Mapped Bazos ad has no Catalog product ID');
  });

  it('maps Bazos ad item lines to Catalog product IDs before forwarding', async () => {
    const prisma = makePrisma();
    const { service, orderClient } = makeService(prisma);

    const result = await service.create({
      accountId: 'account-1',
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
    }));
    expect(prisma.bazosOrder.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: order.id },
      data: { orderId: 'central-order-1', forwarded: true },
    }));
    expect(result.forwarding).toEqual({ forwarded: true, orderId: 'central-order-1', itemCount: 1 });
  });

  it('reports webhook ingestion unavailable instead of pretending to ingest orders', async () => {
    const prisma = makePrisma();
    const { service, orderClient } = makeService(prisma);

    const result = await service.handleWebhook({ event: 'order.created' });

    expect(orderClient.createOrder).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      available: false,
      reason: 'BAZOS_ORDER_ITEM_MAPPING_UNAVAILABLE',
      missing: '[MISSING: Bazos order item ingestion contract]',
    }));
  });
});
