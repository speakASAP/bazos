import { BazosAdService } from './bazos-ad.service';

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
}

const identity = { id: 'identity-1', userId: 'user-1' };

const publishedAd = {
  id: 'ad-1',
  identityId: 'identity-1',
  title: 'Published ad',
  description: 'Description',
  price: 1000,
  category: 'ostatni',
  location: 'Praha',
  stockQuantity: 1,
  bazosAdId: 'https://ostatni.bazos.cz/inzerat/220689308/published-ad.php',
  publishStatus: 'published',
  lastPolicyCheck: {
    allowed: true,
    draftOptions: { rubric: 'ostatni', priceOption: 'fixed_price', media: [] },
    pendingBazosUpdate: {
      required: true,
      savedAt: '2026-06-28T23:52:38.691Z',
      bazosAdId: 'https://ostatni.bazos.cz/inzerat/220689308/published-ad.php',
    },
  },
};

function makePrisma(ad: any = publishedAd) {
  let currentAd = ad;
  return {
    bazosIdentity: {
      findMany: jest.fn().mockResolvedValue([identity]),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...identity, ...data })),
    },
    bazosAd: {
      findFirst: jest.fn().mockImplementation(() => Promise.resolve(currentAd)),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([currentAd])),
      update: jest.fn().mockImplementation(({ data }) => {
        currentAd = { ...currentAd, ...data };
        return Promise.resolve(currentAd);
      }),
      count: jest.fn().mockResolvedValue(0),
    },
  } as any;
}

function makeService(prisma: any) {
  return new BazosAdService(prisma, makeLogger(), { evaluate: jest.fn() } as any);
}

describe('BazosAdService pending Bazos updates', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps the pending flag when public Bazoš date is older than the local saved update day', async () => {
    const prisma = makePrisma();
    const service = makeService(prisma) as any;
    jest.spyOn(service, 'fetchBazosPublicStatus').mockResolvedValue({ available: true, updatedAt: new Date(Date.UTC(2026, 5, 27)) });

    const result = await service.findMany('user-1', {});

    expect(result[0].lastPolicyCheck.pendingBazosUpdate.required).toBe(true);
    expect(prisma.bazosAd.update).not.toHaveBeenCalled();
  });

  it('clears the pending flag when public Bazoš date is same day or newer than local saved update', async () => {
    const prisma = makePrisma();
    const service = makeService(prisma) as any;
    jest.spyOn(service, 'fetchBazosPublicStatus').mockResolvedValue({ available: true, updatedAt: new Date(Date.UTC(2026, 5, 28)) });

    await service.findMany('user-1', {});

    const updateData = prisma.bazosAd.update.mock.calls[0][0].data;
    expect(updateData.lastPolicyCheck.pendingBazosUpdate).toBeUndefined();
    expect(updateData.lastPolicyCheck.draftOptions).toEqual(publishedAd.lastPolicyCheck.draftOptions);
    expect(updateData.lastPolicyCheck.bazosPublicUpdatedAt).toBe('2026-06-28T00:00:00.000Z');
    expect(updateData.lastPolicyCheck.previousPendingBazosUpdate).toEqual(publishedAd.lastPolicyCheck.pendingBazosUpdate);
  });

  it('marks an active published ad as deleted when the public Bazoš listing is gone', async () => {
    const prisma = makePrisma({ ...publishedAd, lastPolicyCheck: { allowed: true } });
    const service = makeService(prisma) as any;
    jest.spyOn(service, 'fetchBazosPublicStatus').mockResolvedValue({ available: false, updatedAt: null, reason: 'http_404' });

    const result = await service.refreshExternalStatuses('user-1');

    expect(result.deleted).toBe(1);
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: publishedAd.id },
      data: expect.objectContaining({
        isActive: false,
        publishStatus: 'deleted',
        lastPolicyCheck: expect.objectContaining({ bazosDeletionReason: 'http_404' }),
      }),
    }));
    expect(prisma.bazosIdentity.update).toHaveBeenCalledWith({ where: { id: identity.id }, data: { activeAdCount: 0 } });
  });

  it('keeps local state unchanged when public Bazoš availability cannot be verified', async () => {
    const prisma = makePrisma({ ...publishedAd, lastPolicyCheck: { allowed: true } });
    const service = makeService(prisma) as any;
    jest.spyOn(service, 'fetchBazosPublicStatus').mockResolvedValue({ available: null, updatedAt: null, reason: 'http_503' });

    const result = await service.refreshExternalStatuses('user-1');

    expect(result.unknown).toBe(1);
    expect(prisma.bazosAd.update).not.toHaveBeenCalled();
    expect(prisma.bazosIdentity.update).toHaveBeenCalledWith({ where: { id: identity.id }, data: { activeAdCount: 0 } });
  });

  it('detects deleted Bazoš pages by their page text', () => {
    const service = makeService(makePrisma()) as any;

    expect(service.isBazosDeletedPage('<html><body>Inzerát neexistuje nebo byl smazán.</body></html>')).toBe(true);
    expect(service.isBazosDeletedPage('<html><body>Inzerát je již vymazán.</body></html>')).toBe(true);
  });

  it('syncs changed public Bazoš listing fields during manual refresh', async () => {
    const prisma = makePrisma({ ...publishedAd, lastPolicyCheck: { allowed: true } });
    const service = makeService(prisma) as any;
    jest.spyOn(service, 'fetchBazosPublicStatus').mockResolvedValue({
      available: true,
      updatedAt: new Date(Date.UTC(2026, 5, 29)),
      listing: {
        title: 'Updated Bazoš title',
        description: 'Updated public description',
        price: 1200,
        category: 'Ostatní',
        location: 'Brno',
        sourceUrl: publishedAd.bazosAdId,
      },
    });

    const result = await service.refreshExternalStatuses('user-1');

    expect(result.checked).toBe(1);
    expect(result.deleted).toBe(0);
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: publishedAd.id },
      data: expect.objectContaining({
        title: 'Updated Bazoš title',
        description: 'Updated public description',
        price: 1200,
        category: 'Ostatní',
        location: 'Brno',
        lastPolicyCheck: expect.objectContaining({
          bazosPublicUpdatedAt: '2026-06-29T00:00:00.000Z',
          bazosPublicSnapshot: expect.objectContaining({ title: 'Updated Bazoš title' }),
        }),
      }),
    }));
  });

  it('enables staggered availability checks after opening Bazoš manage flow', async () => {
    const prisma = makePrisma({ ...publishedAd, lastPolicyCheck: { allowed: true } });
    const service = makeService(prisma) as any;

    await service.recordBazosManageOpened(publishedAd.id, 'user-1');

    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: publishedAd.id },
      data: expect.objectContaining({
        lastPolicyCheck: expect.objectContaining({
          bazosAvailabilityCheck: expect.objectContaining({
            enabled: true,
            source: 'manage_opened',
            lastManageOpenedAt: expect.any(String),
            nextCheckAt: expect.any(String),
          }),
        }),
      }),
    }));
  });


  it('refreshes and syncs a managed Bazoš listing whenever its detail is opened locally', async () => {
    const managedAd = {
      ...publishedAd,
      lastPolicyCheck: {
        allowed: true,
        bazosAvailabilityCheck: { enabled: true, source: 'manage_opened' },
      },
      // Относительная дата: жёстко заданная протухла 2026-07-12 и увела тест
      // в ветку tracking_expired, из-за чего он падал вместо проверки синхронизации.
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const prisma = makePrisma(managedAd);
    const service = makeService(prisma) as any;
    jest.spyOn(service, 'fetchBazosPublicStatus').mockResolvedValue({
      available: true,
      updatedAt: new Date(Date.UTC(2026, 5, 29)),
      listing: {
        title: 'Managed title from Bazoš',
        description: 'Managed public description',
        price: 1300,
        category: 'Ostatní',
        location: 'Plzeň',
        sourceUrl: managedAd.bazosAdId,
      },
    });

    const result = await service.findById(publishedAd.id, 'user-1');

    expect(result.title).toBe('Managed title from Bazoš');
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: publishedAd.id },
      data: expect.objectContaining({
        title: 'Managed title from Bazoš',
        description: 'Managed public description',
        price: 1300,
        category: 'Ostatní',
        location: 'Plzeň',
      }),
    }));
    expect(prisma.bazosAd.update).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        lastPolicyCheck: expect.objectContaining({
          bazosAvailabilityCheck: expect.objectContaining({
            enabled: true,
            lastReason: 'checked_on_open',
          }),
        }),
      }),
    }));
  });

  it('stops managed Bazoš checks after the listing lifetime expires', async () => {
    const expiredManagedAd = {
      ...publishedAd,
      lastPolicyCheck: {
        allowed: true,
        bazosAvailabilityCheck: { enabled: true, source: 'manage_opened' },
      },
      expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const prisma = makePrisma(expiredManagedAd);
    const service = makeService(prisma) as any;
    const fetchSpy = jest.spyOn(service, 'fetchBazosPublicStatus');

    await service.findById(publishedAd.id, 'user-1');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: publishedAd.id },
      data: expect.objectContaining({
        lastPolicyCheck: expect.objectContaining({
          bazosAvailabilityCheck: expect.objectContaining({
            enabled: false,
            lastReason: 'tracking_expired',
          }),
        }),
      }),
    }));
  });


  it('creates a catalog product and links a manual Bazoš draft when requested', async () => {
    const createdAd = {
      id: 'manual-ad-1',
      identityId: identity.id,
      productId: 'catalog-product-1',
      title: 'Manual catalog item',
      price: 990,
      publishStatus: 'draft',
    };
    const prisma = {
      bazosIdentity: {
        findFirst: jest.fn().mockResolvedValue({ ...identity, accountId: 'account-1' }),
      },
      bazosAd: {
        create: jest.fn().mockResolvedValue(createdAd),
      },
    } as any;
    const catalog = {
      searchProducts: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 }),
      createProduct: jest.fn().mockResolvedValue({ id: 'catalog-product-1', title: 'Manual catalog item', tags: [] }),
      getProductById: jest.fn().mockResolvedValue({ id: 'catalog-product-1', title: 'Manual catalog item', tags: [] }),
      updateProduct: jest.fn().mockResolvedValue({ id: 'catalog-product-1' }),
      createMedia: jest.fn().mockResolvedValue({ id: 'media-1' }),
    } as any;
    const service = new BazosAdService(prisma, makeLogger(), { evaluate: jest.fn() } as any, catalog);

    const result = await service.createDraft('user-1', {
      identityId: identity.id,
      title: 'Manual catalog item',
      description: 'Bazoš description',
      price: 990,
      category: 'ostatni',
      saveToCatalog: true,
      resaleEnabled: true,
      media: [{ url: 'https://cdn.example.test/manual-catalog-item.jpg', thumbnailUrl: 'https://cdn.example.test/manual-catalog-item-thumb.jpg' }],
    }, 'Bearer user-token');

    expect(catalog.searchProducts).toHaveBeenCalledWith(expect.not.objectContaining({ isActive: true }), 'Bearer user-token');
    expect(catalog.createProduct).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Manual catalog item',
      tags: expect.arrayContaining(['bazos', 'bazos-draft']),
      resaleEnabled: true,
      isActive: false,
      lifecycle: 'draft',
    }), 'Bearer user-token');
    expect(catalog.createMedia).toHaveBeenCalledWith(expect.objectContaining({
      productId: 'catalog-product-1',
      type: 'image',
      url: 'https://cdn.example.test/manual-catalog-item.jpg',
      isPrimary: true,
    }), 'Bearer user-token');
    expect(prisma.bazosAd.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        productId: 'catalog-product-1',
        lastPolicyCheck: expect.objectContaining({
          draftOptions: expect.objectContaining({
            media: expect.arrayContaining([expect.objectContaining({ url: 'https://cdn.example.test/manual-catalog-item.jpg' })]),
          }),
        }),
      }),
    }));
    expect(catalog.updateProduct).toHaveBeenLastCalledWith(
      'catalog-product-1',
      expect.objectContaining({ tags: expect.arrayContaining(['bazos-ad:manual-ad-1']) }),
      'Bearer user-token',
    );
    expect(result.productId).toBe('catalog-product-1');
  });

  it('updates resaleEnabled only when an existing catalog product is owned by the user', async () => {
    const prisma = {
      bazosIdentity: {
        findFirst: jest.fn().mockResolvedValue({ ...identity, accountId: 'account-1' }),
      },
      bazosAd: {
        create: jest.fn().mockResolvedValue({ id: 'manual-ad-2', identityId: identity.id, productId: 'catalog-product-2' }),
      },
    } as any;
    const catalog = {
      searchProducts: jest.fn().mockResolvedValue({ items: [{ id: 'catalog-product-2', title: 'Owned catalog item', ownerUserId: 'user-1', tags: [] }], total: 1, page: 1, limit: 10 }),
      updateProduct: jest.fn().mockResolvedValue({ id: 'catalog-product-2' }),
      getProductById: jest.fn().mockResolvedValue({ id: 'catalog-product-2', title: 'Owned catalog item', tags: [] }),
      createMedia: jest.fn().mockResolvedValue({ id: 'media-2' }),
    } as any;
    const service = new BazosAdService(prisma, makeLogger(), { evaluate: jest.fn() } as any, catalog);

    await service.createDraft('user-1', {
      identityId: identity.id,
      title: 'Owned catalog item',
      description: 'Bazoš description',
      price: 1290,
      category: 'ostatni',
      saveToCatalog: true,
      resaleEnabled: true,
      media: [{ url: 'https://cdn.example.test/owned-catalog-item.jpg' }],
    }, 'Bearer user-token');

    expect(catalog.searchProducts).toHaveBeenCalledWith(expect.objectContaining({ catalogScope: 'own' }), 'Bearer user-token');
    expect(catalog.updateProduct).toHaveBeenCalledWith(
      'catalog-product-2',
      expect.objectContaining({ resaleEnabled: true }),
      'Bearer user-token',
    );
  });

  it('does not forward resaleEnabled when a matched catalog product is not owned by the user', async () => {
    const prisma = {
      bazosIdentity: {
        findFirst: jest.fn().mockResolvedValue({ ...identity, accountId: 'account-1' }),
      },
      bazosAd: {
        create: jest.fn().mockResolvedValue({ id: 'manual-ad-3', identityId: identity.id, productId: 'catalog-product-3' }),
      },
    } as any;
    const catalog = {
      searchProducts: jest.fn().mockResolvedValue({ items: [{ id: 'catalog-product-3', title: 'Shared catalog item', ownerUserId: 'other-user', tags: [] }], total: 1, page: 1, limit: 10 }),
      updateProduct: jest.fn().mockResolvedValue({ id: 'catalog-product-3' }),
      getProductById: jest.fn().mockResolvedValue({ id: 'catalog-product-3', title: 'Shared catalog item', tags: [] }),
      createMedia: jest.fn().mockResolvedValue({ id: 'media-3' }),
    } as any;
    const service = new BazosAdService(prisma, makeLogger(), { evaluate: jest.fn() } as any, catalog);

    await service.createDraft('user-1', {
      identityId: identity.id,
      title: 'Shared catalog item',
      description: 'Bazoš description',
      price: 1490,
      category: 'ostatni',
      saveToCatalog: true,
      resaleEnabled: true,
      media: [{ url: 'https://cdn.example.test/shared-catalog-item.jpg' }],
    }, 'Bearer user-token');

    const updatePayload = catalog.updateProduct.mock.calls[0][1];
    expect(updatePayload.resaleEnabled).toBeUndefined();
  });

  it('rejects manual Bazoš draft creation without at least one photo URL', async () => {
    const prisma = {
      bazosIdentity: {
        findFirst: jest.fn().mockResolvedValue({ ...identity, accountId: 'account-1' }),
      },
      bazosAd: {
        create: jest.fn(),
      },
    } as any;
    const service = new BazosAdService(prisma, makeLogger(), { evaluate: jest.fn() } as any);

    await expect(service.createDraft('user-1', {
      identityId: identity.id,
      title: 'Manual item without media',
      description: 'Bazoš description',
      price: 990,
      category: 'ostatni',
      saveToCatalog: true,
    })).rejects.toThrow('At least one photo URL is required before creating a Bazos ad');

    expect(prisma.bazosAd.create).not.toHaveBeenCalled();
  });

  it('parses the public Bazoš listing date format', () => {
    const service = makeService(makePrisma()) as any;

    expect(service.parseBazosUpdatedDate('Cena</td><td>[28.6. 2026]</td>')?.toISOString()).toBe('2026-06-28T00:00:00.000Z');
  });
});
