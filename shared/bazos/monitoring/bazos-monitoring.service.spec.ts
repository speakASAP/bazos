import { NotFoundException } from '@nestjs/common';
import { REVIEW_STATE, SESSION_STATE } from '../identity/bazos-identity.types';
import { BazosMonitoringService } from './bazos-monitoring.service';

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
}

const identity = {
  id: '22222222-2222-4222-8222-222222222222',
  userId: 'user-1',
  phoneNumber: '+420777000000',
  contactPhone: '+420777000001',
  encryptedSession: { ciphertext: 'secret' },
  displayName: 'Seller',
  status: 'verified',
  sessionState: SESSION_STATE.ACTIVE,
  reviewState: REVIEW_STATE.CLEAR,
  activeAdCount: 3,
  verificationExpiresAt: null,
  nextPublishNotBefore: null,
};

const ad = {
  id: '33333333-3333-4333-8333-333333333333',
  productId: '11111111-1111-4111-8111-111111111111',
  title: 'Telefon test',
  category: 'elektro',
  publishStatus: 'blocked_policy',
  challengeState: null,
  bazosAdId: null,
  isActive: true,
  description: 'not returned',
};

const policyBlockedAttempt = {
  id: 'attempt-policy-blocked',
  identityId: identity.id,
  adId: ad.id,
  productId: ad.productId,
  status: 'policy_blocked',
  policyResult: { failures: [{ gate: 'public_duplicate', message: 'duplicate found' }] },
  challengeState: null,
  notBefore: null,
  startedAt: null,
  completedAt: new Date('2026-06-12T12:00:00.000Z'),
  updatedAt: new Date('2026-06-12T12:00:00.000Z'),
  error: null,
  identity,
  ad,
};

function makePrisma(overrides: Record<string, any> = {}) {
  return {
    bazosIdentity: {
      findMany: jest.fn().mockImplementation((args?: any) => {
        if (args?.select?.id && Object.keys(args.select).length === 1) return Promise.resolve([{ id: identity.id }]);
        if (args?.select?.activeAdCount) return Promise.resolve(overrides.reconcileIdentities ?? [{ id: identity.id, activeAdCount: 3 }]);
        return Promise.resolve(overrides.identities ?? [identity]);
      }),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...identity, ...data })),
    },
    bazosPublishAttempt: {
      groupBy: jest.fn().mockResolvedValue(overrides.attemptGroups ?? [{ status: 'policy_blocked', _count: { status: 1 } }]),
      count: jest.fn().mockResolvedValue(overrides.staleSubmittingCount ?? 0),
      findMany: jest.fn().mockResolvedValue(overrides.attempts ?? [policyBlockedAttempt]),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...policyBlockedAttempt, ...data })),
    },
    bazosAd: {
      count: jest.fn().mockResolvedValue(overrides.activeAdCount ?? 2),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...ad, ...data })),
    },
  } as any;
}

function makeService(prisma: any) {
  return new BazosMonitoringService(prisma, makeLogger());
}

describe('BazosMonitoringService', () => {
  it('returns compliance metrics including publish attempts and policy gate failures', async () => {
    const prisma = makePrisma({
      identities: [{ ...identity, reviewState: REVIEW_STATE.CAPTCHA_OR_HUMAN_CHECK_REQUIRED }],
      attempts: [policyBlockedAttempt, { ...policyBlockedAttempt, id: 'attempt-challenge', status: 'challenge_required', challengeState: REVIEW_STATE.SESSION_EXPIRED }],
      staleSubmittingCount: 1,
      activeAdCount: 4,
    });
    const service = makeService(prisma);

    const result = await service.summary('user-1');

    expect(result.metrics).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'bazos_publish_attempts_total' }),
      expect.objectContaining({ name: 'bazos_policy_gate_failures_total', labels: { gate: 'public_duplicate' } }),
      expect.objectContaining({ name: 'bazos_challenge_states_total', labels: { state: REVIEW_STATE.SESSION_EXPIRED } }),
      expect.objectContaining({ name: 'bazos_identities_needing_review', value: 1 }),
      expect.objectContaining({ name: 'bazos_active_ads_tracked', value: 4 }),
      expect.objectContaining({ name: 'bazos_stale_submitting_attempts', value: 1 }),
    ]));
  });

  it('returns blocked attempts without exposing phone numbers or encrypted sessions', async () => {
    const prisma = makePrisma();
    const service = makeService(prisma);

    const result = await service.blockedAttempts('user-1', { limit: 10 });
    const returned = result.attempts[0];

    expect(returned.status).toBe('policy_blocked');
    expect(returned.policyFailures).toEqual(policyBlockedAttempt.policyResult.failures);
    expect((returned.identity as any).phoneNumber).toBeUndefined();
    expect((returned.identity as any).contactPhone).toBeUndefined();
    expect((returned.identity as any).encryptedSession).toBeUndefined();
    expect((returned.ad as any).description).toBeUndefined();
  });

  it('lists identities needing review with sanitized fields', async () => {
    const prisma = makePrisma({ identities: [{ ...identity, reviewState: REVIEW_STATE.BLOCKED_BY_BAZOS }] });
    const service = makeService(prisma);

    const result = await service.reviewIdentities('user-1');

    expect(result.count).toBe(1);
    expect(result.identities[0].reviewState).toBe(REVIEW_STATE.BLOCKED_BY_BAZOS);
    expect((result.identities[0] as any).phoneNumber).toBeUndefined();
    expect((result.identities[0] as any).encryptedSession).toBeUndefined();
  });

  it('reconciles tracked active ad counts from local published ads', async () => {
    const prisma = makePrisma({ reconcileIdentities: [{ id: identity.id, activeAdCount: 3 }], activeAdCount: 1 });
    const service = makeService(prisma);

    const result = await service.reconcileIdentityCounts('user-1', {});

    expect(prisma.bazosIdentity.update).toHaveBeenCalledWith({ where: { id: identity.id }, data: { activeAdCount: 1 } });
    expect(result.identities[0]).toEqual({
      identityId: identity.id,
      previousActiveAdCount: 3,
      reconciledActiveAdCount: 1,
      changed: true,
    });
  });

  it('fails reconciliation when a requested identity is not owned by the user', async () => {
    const prisma = makePrisma({ reconcileIdentities: [] });
    const service = makeService(prisma);

    await expect(service.reconcileIdentityCounts('user-1', { identityId: identity.id })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('expires stale submitting attempts without retrying or publishing', async () => {
    const staleAttempt = { ...policyBlockedAttempt, status: 'submitting', startedAt: new Date('2026-06-12T11:00:00.000Z') };
    const prisma = makePrisma({ attempts: [staleAttempt] });
    const service = makeService(prisma);

    const result = await service.expireStaleSubmissions('user-1', { maxAgeMinutes: 30 });

    expect(prisma.bazosPublishAttempt.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'failed' }) }));
    expect(prisma.bazosAd.update).toHaveBeenCalledWith(expect.objectContaining({ data: { publishStatus: 'failed' } }));
    expect(result.expired).toBe(1);
  });

  it('smoke: policy-blocked attempts remain blocked and observable instead of publishable', async () => {
    const prisma = makePrisma({ attempts: [policyBlockedAttempt] });
    const service = makeService(prisma);

    const result = await service.blockedAttempts('user-1', {});

    expect(result.attempts[0].status).toBe('policy_blocked');
    expect(result.attempts[0].status).not.toBe('queued');
    expect(result.attempts[0].status).not.toBe('submitting');
  });
});
