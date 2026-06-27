import { BadRequestException } from '@nestjs/common';
import { BazosCatalogSellActionService } from './bazos-catalog-sell-action.service';

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
}

const identity = {
  id: '22222222-2222-4222-8222-222222222222',
  userId: 'user-1',
  displayName: 'Seller',
  contactName: 'Seller Contact',
  defaultZip: '11000',
  defaultLocation: 'Praha',
  status: 'verified',
  reviewState: 'clear',
  sessionState: 'active',
  activeAdCount: 7,
  verificationExpiresAt: null,
  nextPublishNotBefore: null,
  encryptedSession: { ciphertext: 'hidden' },
};

const draft = {
  id: '33333333-3333-4333-8333-333333333333',
  productId: '11111111-1111-4111-8111-111111111111',
  identityId: identity.id,
  title: 'Telefon test',
  price: 1000,
  description: 'Puvodni katalogovy popis',
  category: 'elektro',
  location: 'Praha',
  publishStatus: 'draft',
  challengeState: null,
  bazosAdId: null,
  lastPolicyCheck: null,
  identity,
};

const mediaOverride = {
  id: 'media-1',
  url: 'https://cdn.example.test/product.jpg',
  thumbnailUrl: 'https://cdn.example.test/product-thumb.jpg',
  altText: 'Product photo',
  title: 'Front view',
  position: 1,
};

const categoryMapping = {
  id: '44444444-4444-4444-8444-444444444444',
  bazosCategory: 'elektro',
  catalogCategoryId: '55555555-5555-4555-8555-555555555555',
};

const blockedPolicy = {
  allowed: false,
  evaluatedAt: new Date('2026-06-12T12:00:00.000Z'),
  failures: [{ gate: 'public_duplicate_check_missing', message: 'Public duplicate evidence is required' }],
};

const allowedPolicy = {
  allowed: true,
  evaluatedAt: new Date('2026-06-12T12:00:00.000Z'),
  failures: [],
  selectedPacingDelaySeconds: 90,
};

const cleanEvidence = {
  publicDuplicateCheck: { checkedAt: new Date().toISOString(), source: 'manual_review' as const, likelyDuplicate: false },
  contentPolicy: { checkedAt: new Date().toISOString(), source: 'manual_review' as const, passed: true },
};

function makePrisma(overrides: Record<string, any> = {}) {
  return {
    bazosIdentity: {
      findFirst: jest.fn().mockResolvedValue(overrides.identity ?? identity),
    },
    bazosCategory: {
      findFirst: jest.fn().mockResolvedValue(overrides.categoryMapping ?? categoryMapping),
    },
    bazosAd: {
      findFirst: (() => {
        const mock = jest.fn();
        if (Object.prototype.hasOwnProperty.call(overrides, 'existingDraft')) {
          mock.mockResolvedValueOnce(overrides.existingDraft);
        }
        return mock.mockResolvedValue(overrides.draft ?? draft);
      })(),
      update: jest.fn().mockResolvedValue(overrides.updatedDraft ?? overrides.draft ?? draft),
    },
    bazosPublishAttempt: {
      findFirst: jest.fn().mockResolvedValue(overrides.latestAttempt ?? null),
    },
  } as any;
}

function makeService(prisma: any, policy = blockedPolicy) {
  const ads = {
    createDraftFromCatalog: jest.fn().mockResolvedValue(draft),
    evaluatePublishPolicy: jest.fn().mockResolvedValue(policy),
  } as any;
  const queue = {
    enqueueDraft: jest.fn().mockResolvedValue({
      queued: true,
      idempotent: false,
      attempt: { id: 'attempt-1', status: 'queued', policyResult: allowedPolicy },
      decision: allowedPolicy,
    }),
  } as any;
  const service = new BazosCatalogSellActionService(prisma, makeLogger(), ads, queue);
  return { service, ads, queue };
}

describe('BazosCatalogSellActionService', () => {
  it('prepares a catalog sell action by creating a local draft and returning policy context without queueing', async () => {
    const prisma = makePrisma({ existingDraft: null });
    const { service, ads, queue } = makeService(prisma);

    const result = await service.prepare('user-1', draft.productId, {
      identityId: identity.id,
      title: draft.title,
      price: 1000,
      category: 'elektro',
      location: 'Praha',
      stockQuantity: 1,
    });

    expect(ads.createDraftFromCatalog).toHaveBeenCalledWith('user-1', expect.objectContaining({ productId: draft.productId }));
    expect(ads.evaluatePublishPolicy).toHaveBeenCalledWith(draft.id, 'user-1');
    expect(queue.enqueueDraft).not.toHaveBeenCalled();
    expect(result.requiresConfirmation).toBe(true);
    expect((result.identity as any).encryptedSession).toBeUndefined();
    expect(result.categoryMapping.mapped).toBe(true);
    expect(result.nextAction).toBe('resolve_policy_failures');
    expect(result.canQueueAfterConfirmation).toBe(true);
  });

  it('updates an existing active draft for the same product and identity with channel-specific fields', async () => {
    const updatedDraft = {
      ...draft,
      title: 'Bazos title',
      description: 'Bazos-only description',
      price: 1500,
      lastPolicyCheck: { draftOptions: { rubric: 'auto', priceOption: 'fixed_price', media: [mediaOverride] } },
    };
    const prisma = makePrisma({ existingDraft: draft, updatedDraft });
    const { service, ads } = makeService(prisma);

    const result = await service.prepare('user-1', draft.productId, {
      identityId: identity.id,
      title: 'Bazos title',
      description: 'Bazos-only description',
      price: 1500,
      category: 'elektro',
      media: [mediaOverride],
    });

    expect(ads.createDraftFromCatalog).not.toHaveBeenCalled();
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: draft.id },
      data: expect.objectContaining({
        title: 'Bazos title',
        description: 'Bazos-only description',
        price: 1500,
        publishStatus: 'draft',
        lastPolicyCheck: expect.objectContaining({ draftOptions: expect.objectContaining({ media: [mediaOverride] }) }),
      }),
    }));
    expect(result.draft.id).toBe(draft.id);
    expect(result.draft.title).toBe('Bazos title');
    expect(result.draft.description).toBe('Bazos-only description');
    expect(result.draft.media).toEqual([mediaOverride]);
  });

  it('requires explicit confirmation before queueing publish', async () => {
    const prisma = makePrisma({ existingDraft: draft });
    const { service, queue } = makeService(prisma, allowedPolicy);

    await expect(
      service.confirm('user-1', draft.productId, {
        adId: draft.id,
        confirmed: false,
        ...cleanEvidence,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(queue.enqueueDraft).not.toHaveBeenCalled();
  });

  it('delegates confirmed publish only to the guarded publisher queue', async () => {
    const prisma = makePrisma({ existingDraft: draft });
    const { service, queue } = makeService(prisma, allowedPolicy);

    const result = await service.confirm('user-1', draft.productId, {
      adId: draft.id,
      confirmed: true,
      ...cleanEvidence,
    });

    expect(queue.enqueueDraft).toHaveBeenCalledWith(draft.id, 'user-1', expect.objectContaining(cleanEvidence));
    expect(result.queue.queued).toBe(true);
    expect(result.nextAction).toBe('poll_publish_status');
  });

  it('surfaces policy blocked status as requiring human action', async () => {
    const latestAttempt = {
      id: 'attempt-1',
      status: 'policy_blocked',
      policyResult: blockedPolicy,
      challengeState: null,
      error: null,
    };
    const prisma = makePrisma({ draft: { ...draft, publishStatus: 'blocked_policy' }, latestAttempt });
    const { service } = makeService(prisma);

    const result = await service.status('user-1', draft.productId, { adId: draft.id });

    expect(result.requiresHumanAction.required).toBe(true);
    expect(result.requiresHumanAction.reason).toBe('policy_blocked');
    expect(result.requiresHumanAction.policyFailures).toEqual(blockedPolicy.failures);
  });


  it('returns published status and listing URL by product without requiring ad or identity query', async () => {
    const publishedDraft = {
      ...draft,
      publishStatus: 'published',
      bazosAdId: '123456789',
      isActive: true,
      updatedAt: new Date('2026-06-12T13:00:00.000Z'),
      identity,
    };
    const prisma = makePrisma({ draft: publishedDraft });
    const { service } = makeService(prisma);

    const result = await service.status('user-1', draft.productId, {});

    expect(prisma.bazosAd.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ productId: draft.productId, isActive: true, identity: { userId: 'user-1' } }),
    }));
    expect(result.publishedOnBazos).toBe(true);
    expect(result.listingUrl).toBe('https://www.bazos.cz/inzerat/123456789/');
    expect(result.draft.publishedOnBazos).toBe(true);
    expect(result.draft.listingUrl).toBe('https://www.bazos.cz/inzerat/123456789/');
  });

  it('surfaces Bazos challenge states for human action without secrets', async () => {
    const challengeDraft = {
      ...draft,
      publishStatus: 'challenge',
      challengeState: 'captcha_or_human_check_required',
      identity,
    };
    const latestAttempt = {
      id: 'attempt-1',
      status: 'challenge_required',
      policyResult: allowedPolicy,
      challengeState: 'captcha_or_human_check_required',
      error: 'captcha shown',
    };
    const prisma = makePrisma({ draft: challengeDraft, latestAttempt });
    const { service } = makeService(prisma);

    const result = await service.status('user-1', draft.productId, { identityId: identity.id });

    expect(result.requiresHumanAction.required).toBe(true);
    expect(result.requiresHumanAction.reason).toBe('captcha_or_human_check_required');
    expect((result.identity as any).encryptedSession).toBeUndefined();
  });
});
