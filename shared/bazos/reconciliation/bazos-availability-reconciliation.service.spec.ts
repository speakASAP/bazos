import { BazosAvailabilityReconciliationService } from './bazos-availability-reconciliation.service';

const productId = '11111111-1111-4111-8111-111111111111';

function makeAd(overrides: any = {}) {
  return {
    id: overrides.id || 'ad-1',
    productId,
    bazosAdId: '220689308',
    stockQuantity: 2,
    isActive: true,
    publishStatus: 'published',
    challengeState: 'clear',
    lastPolicyCheck: {},
    ...overrides,
  };
}

function makeHarness(input: { ads: any[]; catalogProducts?: Record<string, any>; warehouseAvailable?: Record<string, number> }) {
  const ads = input.ads.map((ad) => ({ ...ad }));
  const prisma = {
    bazosAd: {
      findMany: jest.fn().mockImplementation(() => Promise.resolve(
        ads.filter((ad) => ad.productId && (
          ad.isActive === true
          || Number(ad.stockQuantity) > 0
          || ['active', 'published', 'publishing', 'queued'].includes(String(ad.publishStatus || '').toLowerCase())
        )),
      )),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const index = ads.findIndex((ad) => ad.id === where.id);
        ads[index] = { ...ads[index], ...data };
        return Promise.resolve(ads[index]);
      }),
    },
  } as any;
  const catalogClient = {
    getProductById: jest.fn().mockImplementation(async (id: string) => {
      if (!(id in (input.catalogProducts || {}))) {
        throw new Error('Product not found');
      }
      return input.catalogProducts?.[id];
    }),
  } as any;
  const warehouseClient = {
    getTotalAvailable: jest.fn().mockImplementation(async (id: string) => input.warehouseAvailable?.[id] ?? 0),
  } as any;
  const logger = { setContext: jest.fn(), log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
  const service = new BazosAvailabilityReconciliationService(prisma, catalogClient, warehouseClient, logger);
  return { service, prisma, catalogClient, warehouseClient, ads };
}

describe('BazosAvailabilityReconciliationService', () => {
  it('disables a sellable Bazos ad when Catalog no longer has the product', async () => {
    const { service, prisma } = makeHarness({ ads: [makeAd()], catalogProducts: {}, warehouseAvailable: { [productId]: 5 } });

    const result = await service.reconcile({ now: new Date('2026-07-02T10:00:00.000Z') });

    expect(result.disabled).toBe(1);
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'ad-1' },
      data: expect.objectContaining({
        stockQuantity: 0,
        isActive: false,
        publishStatus: 'deleted',
        challengeState: null,
        lastPolicyCheck: expect.objectContaining({
          availabilityReconciliation: expect.objectContaining({
            status: 'applied',
            reason: 'catalog_product_missing',
            externalBlocker: '[MISSING: approved Bazos external delete/de-list capability]',
            positiveRefreshBlocker: '[MISSING: safe catalog-event refresh policy]',
          }),
        }),
      }),
    }));
  });

  it('disables a sellable Bazos ad when Warehouse availability is zero', async () => {
    const { service, prisma } = makeHarness({
      ads: [makeAd({ stockQuantity: 6 })],
      catalogProducts: { [productId]: { id: productId, isActive: true, status: 'active', isSellable: true } },
      warehouseAvailable: { [productId]: 0 },
    });

    const result = await service.reconcile();

    expect(result.disabled).toBe(1);
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        stockQuantity: 0,
        isActive: false,
        publishStatus: 'deleted',
        lastPolicyCheck: expect.objectContaining({
          availabilityReconciliation: expect.objectContaining({
            reason: 'warehouse_stock_unavailable',
            warehouseAvailable: 0,
          }),
        }),
      }),
    }));
  });

  it('is idempotent on rerun after local fail-closed state is applied', async () => {
    const { service, prisma } = makeHarness({
      ads: [makeAd({ stockQuantity: 1 })],
      catalogProducts: { [productId]: { id: productId, isActive: false } },
      warehouseAvailable: { [productId]: 4 },
    });

    const first = await service.reconcile();
    const second = await service.reconcile();

    expect(first.disabled).toBe(1);
    expect(second.scanned).toBe(0);
    expect(second.disabled).toBe(0);
    expect(prisma.bazosAd.update).toHaveBeenCalledTimes(1);
  });
});
