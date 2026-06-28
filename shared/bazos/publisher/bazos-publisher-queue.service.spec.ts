import { BadRequestException } from '@nestjs/common';
import { REVIEW_STATE } from '../identity/bazos-identity.types';
import { BazosPublisherQueueService } from './bazos-publisher-queue.service';

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
}

const cleanEvidence = {
  publicDuplicateCheck: { checkedAt: new Date().toISOString(), source: 'manual_review' as const, likelyDuplicate: false },
  contentPolicy: { checkedAt: new Date().toISOString(), source: 'manual_review' as const, passed: true },
};

const identity = {
  id: 'identity-1',
  userId: 'user-1',
  displayName: 'Seller',
  contactName: 'Seller Contact',
  contactPhone: '+420777000000',
  phoneNumber: '+420777000000',
  defaultZip: '11000',
  defaultLocation: 'Praha',
};

const ad = {
  id: 'ad-1',
  identityId: 'identity-1',
  productId: '11111111-1111-4111-8111-111111111111',
  title: 'Telefon test',
  description: 'Popis testovaciho inzeratu',
  price: 1000,
  category: 'elektro',
  location: 'Praha',
  bazosAdId: null,
  publishStatus: 'draft',
  isActive: true,
  lastPolicyCheck: {
    draftOptions: {
      media: [{ id: 'media-1', url: 'https://cdn.example.test/product.jpg', thumbnailUrl: 'https://cdn.example.test/product-thumb.jpg', altText: 'Product photo', title: 'Front view', position: 1 }],
    },
  },
  identity,
};

function allowedPolicy() {
  return {
    allowed: true,
    failures: [],
    evaluatedAt: new Date('2026-06-12T12:00:00.000Z'),
    selectedPacingDelaySeconds: 90,
  };
}

function blockedPolicy() {
  return {
    allowed: false,
    failures: [{ gate: 'public_duplicate', message: 'duplicate found' }],
    evaluatedAt: new Date('2026-06-12T12:00:00.000Z'),
  };
}

function makePrisma(overrides: Partial<Record<string, any>> = {}) {
  return {
    bazosAd: {
      findFirst: jest.fn().mockResolvedValue(overrides.ad ?? ad),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...ad, ...data })),
    },
    bazosIdentity: {
      findMany: jest.fn().mockResolvedValue([{ id: 'identity-1' }]),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...identity, ...data })),
    },
    bazosPublishAttempt: {
      findFirst: jest.fn().mockResolvedValue(overrides.existingAttempt ?? null),
      findMany: jest.fn().mockResolvedValue(overrides.dueAttempts ?? []),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'attempt-1', ...data })),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'attempt-1', ...data, ad, identity })),
    },
  } as any;
}

function makeService(prisma: any, policyResult: any = allowedPolicy()) {
  const policy = { evaluate: jest.fn().mockResolvedValue(policyResult) } as any;
  const identities = {
    reservePublishSlot: jest.fn(),
    incrementActiveAdCount: jest.fn(),
    recordCategoryPublish: jest.fn(),
  } as any;
  const service = new BazosPublisherQueueService(prisma, makeLogger(), policy, identities);
  return { service, policy, identities };
}

describe('BazosPublisherQueueService', () => {
  it('queues a draft, reserves notBefore before worker wait, and stores an audit attempt', async () => {
    const prisma = makePrisma();
    const { service, identities } = makeService(prisma);

    const result = await service.enqueueDraft('ad-1', 'user-1', cleanEvidence);

    expect(result.queued).toBe(true);
    expect(identities.reservePublishSlot).toHaveBeenCalledWith('identity-1', new Date('2026-06-12T12:01:30.000Z'));
    expect(prisma.bazosPublishAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'queued',
          identityId: 'identity-1',
          adId: 'ad-1',
          notBefore: new Date('2026-06-12T12:01:30.000Z'),
        }),
      }),
    );
  });

  it('returns the existing queued attempt idempotently', async () => {
    const existingAttempt = { id: 'attempt-existing', status: 'queued', adId: 'ad-1', identityId: 'identity-1' };
    const prisma = makePrisma({ existingAttempt });
    const { service, policy, identities } = makeService(prisma);

    const result = await service.enqueueDraft('ad-1', 'user-1', cleanEvidence);

    expect(result).toEqual({ queued: true, idempotent: true, attempt: existingAttempt });
    expect(policy.evaluate).not.toHaveBeenCalled();
    expect(identities.reservePublishSlot).not.toHaveBeenCalled();
  });

  it('records policy-blocked enqueue attempts without reserving a publish slot', async () => {
    const prisma = makePrisma();
    const { service, identities } = makeService(prisma, blockedPolicy());

    const result = await service.enqueueDraft('ad-1', 'user-1', cleanEvidence);

    expect(result.queued).toBe(false);
    expect(identities.reservePublishSlot).not.toHaveBeenCalled();
    expect(prisma.bazosPublishAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'policy_blocked' }) }),
    );
  });

  it('does not claim when another attempt is submitting for the same identity', async () => {
    const dueAttempt = { id: 'attempt-1', identityId: 'identity-1', adId: 'ad-1', status: 'queued', ad, identity };
    const prisma = makePrisma({ dueAttempts: [dueAttempt], existingAttempt: { id: 'attempt-active' } });
    const { service } = makeService(prisma);

    const result = await service.claimNext('user-1', cleanEvidence);

    expect(result).toEqual({ claimed: false, reason: 'no_due_attempts' });
    expect(prisma.bazosPublishAttempt.update).not.toHaveBeenCalled();
  });

  it('re-checks policy on claim and blocks instead of submitting when gates fail', async () => {
    const dueAttempt = { id: 'attempt-1', identityId: 'identity-1', adId: 'ad-1', status: 'queued', ad, identity };
    const prisma = makePrisma({ dueAttempts: [dueAttempt] });
    prisma.bazosPublishAttempt.findFirst = jest.fn().mockResolvedValue(null);
    const { service } = makeService(prisma, blockedPolicy());

    const result = await service.claimNext('user-1', cleanEvidence);

    expect(result.claimed).toBe(false);
    expect(result.reason).toBe('policy_blocked');
    expect(prisma.bazosPublishAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'policy_blocked' }) }),
    );
  });

  it('claims a due attempt and returns a submission packet without encrypted session data', async () => {
    const dueAttempt = { id: 'attempt-1', identityId: 'identity-1', adId: 'ad-1', status: 'queued', ad, identity };
    const prisma = makePrisma({ dueAttempts: [dueAttempt] });
    prisma.bazosPublishAttempt.findFirst = jest.fn().mockResolvedValue(null);
    const { service } = makeService(prisma);

    const result = await service.claimNext('user-1', cleanEvidence);

    expect(result.claimed).toBe(true);
    expect(result.submission.requiresVerifiedHumanSession).toBe(true);
    expect((result.submission.identity as any).encryptedSession).toBeUndefined();
    expect(result.submission.prohibitedAutomation).toContain('captcha_solving');
    expect(result.submission.ad.media).toEqual([{ id: 'media-1', url: 'https://cdn.example.test/product.jpg', thumbnailUrl: 'https://cdn.example.test/product-thumb.jpg', altText: 'Product photo', title: 'Front view', position: 1 }]);
  });

  it('returns a submission packet for an active attempt without changing status', async () => {
    const prisma = makePrisma();
    prisma.bazosPublishAttempt.findFirst = jest.fn().mockResolvedValue({
      id: 'attempt-1',
      status: 'submitting',
      identityId: 'identity-1',
      adId: 'ad-1',
      ad,
      identity,
    });
    const { service } = makeService(prisma);

    const result = await service.submissionForAttempt('attempt-1', 'user-1');

    expect(result.submission.requiresOperatorBrowser).toBe(true);
    expect(result.submission.serverSideBazosRequestsAllowed).toBe(false);
    expect(result.submission.ad.title).toBe('Telefon test');
    expect(prisma.bazosPublishAttempt.update).not.toHaveBeenCalled();
  });

  it('records successful publish metadata, active count, and category cadence', async () => {
    const prisma = makePrisma();
    prisma.bazosPublishAttempt.findFirst = jest.fn().mockResolvedValue({
      id: 'attempt-1',
      status: 'submitting',
      identityId: 'identity-1',
      adId: 'ad-1',
      ad,
      identity,
    });
    const { service, identities } = makeService(prisma);

    await service.recordResult('attempt-1', 'user-1', {
      success: true,
      bazosAdId: 'bazos-123',
      expiresAt: '2026-07-12T12:00:00.000Z',
    });

    expect(prisma.bazosPublishAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'submitted' }) }),
    );
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bazosAdId: 'bazos-123', publishStatus: 'published' }),
      }),
    );
    expect(identities.incrementActiveAdCount).toHaveBeenCalledWith('identity-1');
    expect(identities.recordCategoryPublish).toHaveBeenCalledWith('identity-1', 'elektro');
  });

  it('records challenge states on the attempt, ad, and identity', async () => {
    const prisma = makePrisma();
    prisma.bazosPublishAttempt.findFirst = jest.fn().mockResolvedValue({
      id: 'attempt-1',
      status: 'submitting',
      identityId: 'identity-1',
      adId: 'ad-1',
      ad,
      identity,
    });
    const { service } = makeService(prisma);

    await service.recordResult('attempt-1', 'user-1', {
      success: false,
      challengeState: REVIEW_STATE.CAPTCHA_OR_HUMAN_CHECK_REQUIRED,
    });

    expect(prisma.bazosPublishAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'challenge_required' }) }),
    );
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ publishStatus: 'challenge' }) }),
    );
    expect(prisma.bazosIdentity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ reviewState: REVIEW_STATE.CAPTCHA_OR_HUMAN_CHECK_REQUIRED }),
      }),
    );
  });

  it('requires bazosAdId for successful results', async () => {
    const prisma = makePrisma();
    prisma.bazosPublishAttempt.findFirst = jest.fn().mockResolvedValue({
      id: 'attempt-1',
      status: 'submitting',
      identityId: 'identity-1',
      adId: 'ad-1',
      ad,
      identity,
    });
    const { service } = makeService(prisma);

    await expect(service.recordResult('attempt-1', 'user-1', { success: true })).rejects.toBeInstanceOf(BadRequestException);
  });
});
