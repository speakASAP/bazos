import { StockEventsSubscriber } from './stock-events.subscriber';

const productId = '11111111-1111-4111-8111-111111111111';

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
}

function makeAd(overrides: any = {}) {
  return {
    id: overrides.id || 'ad-1',
    identityId: 'identity-1',
    bazosAdId: '220689308',
    stockQuantity: 2,
    isActive: true,
    publishStatus: 'published',
    lastPolicyCheck: {},
    ...overrides,
  };
}

function makePrisma(ads: any[], updateImpl?: (args: any) => Promise<any>) {
  return {
    bazosAd: {
      findMany: jest.fn().mockResolvedValue(ads),
      update: jest.fn().mockImplementation(updateImpl || (({ where, data }) => Promise.resolve({ ...ads.find((ad) => ad.id === where.id), ...data }))),
    },
  } as any;
}

function makeService(prisma: any) {
  process.env.BAZOS_STOCK_WRITE_INTERVAL_MS = '0';
  return new StockEventsSubscriber(makeLogger(), prisma);
}

describe('StockEventsSubscriber', () => {
  afterEach(() => {
    delete process.env.BAZOS_STOCK_WRITE_INTERVAL_MS;
  });

  it('applies stock.updated using Warehouse available as the target quantity', async () => {
    const ad = makeAd({ stockQuantity: 1, isActive: false, publishStatus: 'draft' });
    const prisma = makePrisma([ad]);
    const service = makeService(prisma);

    await (service as any).handleStockEvent({ id: 'event-1', type: 'stock.updated', productId, available: 7 });

    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: ad.id },
      data: expect.objectContaining({
        stockQuantity: 7,
        isActive: true,
        lastPolicyCheck: expect.objectContaining({
          warehouseStockSync: expect.objectContaining({
            eventId: 'event-1',
            eventType: 'stock.updated',
            sourceField: 'available',
            targetQuantity: 7,
            mutatesWarehouse: false,
          }),
        }),
      }),
    }));
  });

  it('forces stock.out to zero and removes Bazos listing from the local sale surface', async () => {
    const ad = makeAd({ stockQuantity: 3, isActive: true, publishStatus: 'published' });
    const prisma = makePrisma([ad]);
    const service = makeService(prisma);

    await (service as any).handleStockEvent({ id: 'event-out', type: 'stock.out', productId, available: 99 });

    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: ad.id },
      data: expect.objectContaining({
        stockQuantity: 0,
        isActive: false,
        publishStatus: 'deleted',
        challengeState: null,
        lastPolicyCheck: expect.objectContaining({
          warehouseStockSync: expect.objectContaining({
            eventId: 'event-out',
            eventType: 'stock.out',
            sourceField: 'stock.out',
            targetQuantity: 0,
            previousPublishStatus: 'published',
          }),
        }),
      }),
    }));
  });

  it('is idempotent for an already applied event', async () => {
    const ad = makeAd({
      lastPolicyCheck: {
        warehouseStockSync: {
          eventId: 'event-1',
          status: 'applied',
          targetQuantity: 4,
        },
      },
    });
    const prisma = makePrisma([ad]);
    const service = makeService(prisma);

    await (service as any).handleStockEvent({ id: 'event-1', type: 'stock.updated', productId, available: 4 });

    expect(prisma.bazosAd.update).not.toHaveBeenCalled();
  });

  it('records durable failure evidence when an ad projection update fails', async () => {
    const ad = makeAd({ stockQuantity: 5 });
    let call = 0;
    const prisma = makePrisma([ad], async ({ data }) => {
      call += 1;
      if (call === 1) throw new Error('database unavailable');
      return { ...ad, ...data };
    });
    const service = makeService(prisma);

    await (service as any).handleStockEvent({ id: 'event-fail', type: 'stock.updated', productId, available: 6 });

    expect(prisma.bazosAd.update).toHaveBeenCalledTimes(2);
    expect(prisma.bazosAd.update).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: ad.id },
      data: expect.objectContaining({
        lastPolicyCheck: expect.objectContaining({
          warehouseStockSync: expect.objectContaining({
            eventId: 'event-fail',
            eventType: 'stock.updated',
            status: 'failed',
            targetQuantity: 6,
            error: 'database unavailable',
          }),
        }),
      }),
    }));
  });
});
