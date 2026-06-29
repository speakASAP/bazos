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
    },
    bazosAd: {
      findFirst: jest.fn().mockResolvedValue(ad),
      findMany: jest.fn().mockResolvedValue([ad]),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...ad, ...data })),
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
    jest.spyOn(service, 'fetchBazosPublicUpdatedAt').mockResolvedValue(new Date(Date.UTC(2026, 5, 27)));

    const result = await service.findMany('user-1', {});

    expect(result[0].lastPolicyCheck.pendingBazosUpdate.required).toBe(true);
    expect(prisma.bazosAd.update).not.toHaveBeenCalled();
  });

  it('clears the pending flag when public Bazoš date is same day or newer than local saved update', async () => {
    const prisma = makePrisma();
    const service = makeService(prisma) as any;
    jest.spyOn(service, 'fetchBazosPublicUpdatedAt').mockResolvedValue(new Date(Date.UTC(2026, 5, 28)));

    await service.findMany('user-1', {});

    const updateData = prisma.bazosAd.update.mock.calls[0][0].data;
    expect(updateData.lastPolicyCheck.pendingBazosUpdate).toBeUndefined();
    expect(updateData.lastPolicyCheck.draftOptions).toEqual(publishedAd.lastPolicyCheck.draftOptions);
    expect(updateData.lastPolicyCheck.bazosPublicUpdatedAt).toBe('2026-06-28T00:00:00.000Z');
    expect(updateData.lastPolicyCheck.previousPendingBazosUpdate).toEqual(publishedAd.lastPolicyCheck.pendingBazosUpdate);
  });

  it('parses the public Bazoš listing date format', () => {
    const service = makeService(makePrisma()) as any;

    expect(service.parseBazosUpdatedDate('Cena</td><td>[28.6. 2026]</td>')?.toISOString()).toBe('2026-06-28T00:00:00.000Z');
  });
});
