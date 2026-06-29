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
  return {
    bazosIdentity: {
      findMany: jest.fn().mockResolvedValue([identity]),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...identity, ...data })),
    },
    bazosAd: {
      findFirst: jest.fn().mockResolvedValue(ad),
      findMany: jest.fn().mockResolvedValue([ad]),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...ad, ...data })),
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
  });

  it('parses the public Bazoš listing date format', () => {
    const service = makeService(makePrisma()) as any;

    expect(service.parseBazosUpdatedDate('Cena</td><td>[28.6. 2026]</td>')?.toISOString()).toBe('2026-06-28T00:00:00.000Z');
  });
});
