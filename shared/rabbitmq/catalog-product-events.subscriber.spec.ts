import { CatalogProductEventsSubscriber } from './catalog-product-events.subscriber';

const productId = '11111111-1111-4111-8111-111111111111';

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
}

function makeAd(overrides: any = {}) {
  return {
    id: overrides.id || 'ad-1',
    bazosAdId: '220689308',
    stockQuantity: 2,
    isActive: true,
    publishStatus: 'published',
    challengeState: 'clear',
    lastPolicyCheck: {},
    ...overrides,
  };
}

function makePrisma(ads: any[]) {
  return {
    bazosAd: {
      findMany: jest.fn().mockResolvedValue(ads),
      update: jest.fn().mockImplementation(({ where, data }) => Promise.resolve({ ...ads.find((ad) => ad.id === where.id), ...data })),
    },
  } as any;
}

function makeService(prisma: any) {
  return new CatalogProductEventsSubscriber(makeLogger(), prisma);
}

describe('CatalogProductEventsSubscriber', () => {
  it('marks Bazos ads not offerable when Catalog archives a product', async () => {
    const ad = makeAd({ stockQuantity: 4, isActive: true, publishStatus: 'published' });
    const prisma = makePrisma([ad]);
    const service = makeService(prisma);

    await (service as any).handleCatalogProductEvent({ eventId: 'catalog-event-1', type: 'catalog.product.archived.v1', productId });

    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: ad.id },
      data: expect.objectContaining({
        stockQuantity: 0,
        isActive: false,
        publishStatus: 'deleted',
        challengeState: null,
        lastPolicyCheck: expect.objectContaining({
          catalogProductAvailabilitySync: expect.objectContaining({
            eventId: 'catalog-event-1',
            eventType: 'catalog.product.archived.v1',
            reason: 'catalog_product_archived',
            targetOfferable: false,
            externalAction: 'not_attempted',
            externalBlocker: '[MISSING: approved Bazos external delete/de-list capability]',
          }),
        }),
      }),
    }));
  });

  it('handles sellability_changed only when afterSellable is false', async () => {
    const ad = makeAd();
    const prisma = makePrisma([ad]);
    const service = makeService(prisma);

    await (service as any).handleCatalogProductEvent({ eventId: 'catalog-event-2', type: 'catalog.product.sellability_changed.v1', payload: { productId, afterSellable: false } });

    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        lastPolicyCheck: expect.objectContaining({
          catalogProductAvailabilitySync: expect.objectContaining({ reason: 'catalog_product_not_sellable' }),
        }),
      }),
    }));
  });

  it('does not reactivate or refresh sellable updates without a safe refresh policy', async () => {
    const ad = makeAd();
    const prisma = makePrisma([ad]);
    const service = makeService(prisma);

    await (service as any).handleCatalogProductEvent({ eventId: 'catalog-event-3', type: 'catalog.product.updated.v1', productId, afterSellable: true });

    expect(prisma.bazosAd.update).not.toHaveBeenCalled();
  });

  it('is idempotent for an already applied Catalog event', async () => {
    const ad = makeAd({
      lastPolicyCheck: {
        catalogProductAvailabilitySync: {
          eventId: 'catalog-event-4',
          status: 'applied',
        },
      },
    });
    const prisma = makePrisma([ad]);
    const service = makeService(prisma);

    await (service as any).handleCatalogProductEvent({ eventId: 'catalog-event-4', type: 'catalog.product.deleted.v1', productId });

    expect(prisma.bazosAd.update).not.toHaveBeenCalled();
  });
});
