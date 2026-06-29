import { PublishPolicyService } from './publish-policy.service';
import { POLICY_GATE } from './publish-policy.types';
import {
  IDENTITY_STATUS,
  REVIEW_STATE,
  MAX_ACTIVE_ADS,
  SESSION_STATE,
  PACING_MIN_SECONDS,
  PACING_MAX_SECONDS,
} from '../identity/bazos-identity.types';

/**
 * In-memory stub for PrismaService. Each test overrides prisma.bazosIdentity.findUnique
 * and prisma.bazosAd.findFirst as needed.
 */
function makePrismaStub(overrides: Partial<{
  identity: any;
  duplicateAd: any;
  categoryMapping: any;
}> = {}) {
  const { identity = null, duplicateAd = null, categoryMapping = { id: 'cat1', isActive: true } } = overrides;
  return {
    bazosIdentity: {
      findUnique: jest.fn().mockResolvedValue(identity),
    },
    bazosAd: {
      findFirst: jest.fn().mockResolvedValue(duplicateAd),
      update: jest.fn(),
    },
    bazosCategory: {
      findFirst: jest.fn().mockResolvedValue(categoryMapping),
    },
  } as any;
}

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
}

function makeWarehouse(overrides: Partial<{ stockRows: any[]; totalAvailable: number }> = {}) {
  return {
    getStockByProduct: jest.fn().mockResolvedValue(overrides.stockRows ?? [{ warehouseId: 'warehouse-1', available: 3 }]),
    getTotalAvailable: jest.fn().mockResolvedValue(overrides.totalAvailable ?? 3),
  } as any;
}

function makePolicyService(prisma: any, warehouse = makeWarehouse()) {
  return new PublishPolicyService(prisma, makeLogger(), warehouse);
}

function baseIdentity(overrides: Partial<any> = {}): any {
  return {
    id: 'identity-1',
    status: IDENTITY_STATUS.VERIFIED,
    reviewState: REVIEW_STATE.CLEAR,
    sessionState: SESSION_STATE.ACTIVE,
    verificationExpiresAt: null,
    activeAdCount: 0,
    nextPublishNotBefore: null,
    categoryCadences: [],
    ...overrides,
  };
}

describe('PublishPolicyService', () => {
  const input = {
    identityId: 'identity-1',
    bazosCategory: 'elektro',
    productId: 'product-1',
    publicDuplicateCheck: { checkedAt: new Date(), source: 'manual_review' as const, likelyDuplicate: false },
    contentPolicy: { checkedAt: new Date(), source: 'manual_review' as const, passed: true },
  };

  describe('Gate 1 — identity.status must be verified', () => {
    it('blocks when status is draft', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity({ status: IDENTITY_STATUS.DRAFT }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.IDENTITY_NOT_VERIFIED)).toBe(true);
    });

    it('allows when status is verified (all other conditions clear)', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(true);
    });

    it('blocks when identity is not found', async () => {
      const prisma = makePrismaStub({ identity: null });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures[0].gate).toBe(POLICY_GATE.IDENTITY_NOT_VERIFIED);
    });
  });

  describe('Gate 2 — reviewState must be clear', () => {
    it.each([
      REVIEW_STATE.VERIFICATION_REQUIRED,
      REVIEW_STATE.BANK_VERIFICATION_REQUIRED,
      REVIEW_STATE.CAPTCHA_OR_HUMAN_CHECK_REQUIRED,
      REVIEW_STATE.SESSION_EXPIRED,
      REVIEW_STATE.BLOCKED_BY_BAZOS,
    ])('blocks when reviewState is %s', async (reviewState) => {
      const prisma = makePrismaStub({ identity: baseIdentity({ reviewState }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.IDENTITY_REVIEW_BLOCKED)).toBe(true);
    });
  });

  describe('Gate 3 — verificationExpiresAt must not be in the past', () => {
    it('blocks when verification has expired', async () => {
      const expired = new Date(Date.now() - 1000);
      const prisma = makePrismaStub({ identity: baseIdentity({ verificationExpiresAt: expired }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.IDENTITY_VERIFICATION_EXPIRED)).toBe(true);
    });

    it('allows when verificationExpiresAt is in the future', async () => {
      const future = new Date(Date.now() + 86400_000);
      const prisma = makePrismaStub({ identity: baseIdentity({ verificationExpiresAt: future }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Gate 4 — sessionState must be active', () => {
    it.each([
      SESSION_STATE.MISSING,
      SESSION_STATE.EXPIRED,
      SESSION_STATE.CHALLENGE,
    ])('blocks when sessionState is %s', async (sessionState) => {
      const prisma = makePrismaStub({ identity: baseIdentity({ sessionState }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.IDENTITY_SESSION_NOT_ACTIVE)).toBe(true);
    });
  });

  describe('Gate 5 — active ad cap', () => {
    it('blocks when activeAdCount >= 50', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity({ activeAdCount: MAX_ACTIVE_ADS }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.ACTIVE_AD_CAP_REACHED)).toBe(true);
    });

    it('allows at 49 active ads', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity({ activeAdCount: MAX_ACTIVE_ADS - 1 }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Gate 6 — pacing: nextPublishNotBefore', () => {
    it('blocks when nextPublishNotBefore is in the future', async () => {
      const future = new Date(Date.now() + 90_000);
      const prisma = makePrismaStub({ identity: baseIdentity({ nextPublishNotBefore: future }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.PACING_TOO_SOON)).toBe(true);
      expect(result.failures.find((f) => f.gate === POLICY_GATE.PACING_TOO_SOON)?.blockedUntil).toEqual(future);
    });

    it('allows when nextPublishNotBefore is in the past', async () => {
      const past = new Date(Date.now() - 1000);
      const prisma = makePrismaStub({ identity: baseIdentity({ nextPublishNotBefore: past }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Gate 7 — 24h category cooldown', () => {
    it('blocks when last category publish was less than 24h ago', async () => {
      const recentPublish = new Date(Date.now() - 23 * 60 * 60 * 1000);
      const identity = baseIdentity({
        categoryCadences: [{ bazosCategory: 'elektro', lastPublishedAt: recentPublish }],
      });
      const prisma = makePrismaStub({ identity });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.CATEGORY_COOLDOWN)).toBe(true);
    });

    it('allows when last category publish was more than 24h ago', async () => {
      const oldPublish = new Date(Date.now() - 25 * 60 * 60 * 1000);
      const identity = baseIdentity({
        categoryCadences: [{ bazosCategory: 'elektro', lastPublishedAt: oldPublish }],
      });
      const prisma = makePrismaStub({ identity });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Gate 8 — local duplicate check', () => {
    it('blocks when an active local ad exists for same product and identity', async () => {
      const prisma = makePrismaStub({
        identity: baseIdentity(),
        duplicateAd: { id: 'existing-ad' },
      });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.LOCAL_DUPLICATE)).toBe(true);
    });

    it('excludes the current draft from local duplicate detection', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity(), duplicateAd: null });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({ ...input, adId: 'current-ad' });
      expect(result.allowed).toBe(true);
      expect(prisma.bazosAd.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: 'current-ad' },
          }),
        }),
      );
    });
  });

  describe('Gate 9 — Warehouse stock authority', () => {
    it('blocks publishing when the draft has no catalog product ID for Warehouse evidence', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({ ...input, productId: undefined });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.WAREHOUSE_STOCK_UNAVAILABLE)).toBe(true);
    });

    it('blocks publishing when Warehouse route evidence is missing', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma, makeWarehouse({ stockRows: [], totalAvailable: 3 }));
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.WAREHOUSE_STOCK_UNAVAILABLE)).toBe(true);
    });

    it('blocks publishing when Warehouse availability is zero', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma, makeWarehouse({ totalAvailable: 0 }));
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.WAREHOUSE_STOCK_UNAVAILABLE)).toBe(true);
    });
  });

  describe('Gate 10 — public duplicate evidence', () => {
    it('blocks when public duplicate evidence is missing', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({
        identityId: input.identityId,
        bazosCategory: input.bazosCategory,
        productId: input.productId,
        contentPolicy: input.contentPolicy,
      });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.PUBLIC_DUPLICATE_CHECK_MISSING)).toBe(true);
    });

    it('blocks when public duplicate evidence is stale', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({
        ...input,
        publicDuplicateCheck: { checkedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), source: 'manual_review' as const, likelyDuplicate: false },
      });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.PUBLIC_DUPLICATE_CHECK_MISSING)).toBe(true);
    });

    it('blocks when public duplicate evidence is not from a trusted source', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({
        ...input,
        publicDuplicateCheck: { checkedAt: new Date(), likelyDuplicate: false } as any,
      });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.PUBLIC_DUPLICATE_CHECK_MISSING)).toBe(true);
    });

    it('blocks when public duplicate evidence has an invalid timestamp', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({
        ...input,
        publicDuplicateCheck: { checkedAt: new Date('bad-date'), source: 'manual_review', likelyDuplicate: false },
      });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.PUBLIC_DUPLICATE_CHECK_MISSING)).toBe(true);
    });

    it('blocks when public duplicate evidence reports a likely duplicate', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({
        ...input,
        publicDuplicateCheck: { checkedAt: new Date(), source: 'manual_review' as const, likelyDuplicate: true, reason: 'matching public listing' },
      });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.PUBLIC_DUPLICATE)).toBe(true);
    });
  });

  describe('Gate 12 — content policy evidence', () => {
    it('blocks when content policy evidence is missing', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({
        identityId: input.identityId,
        bazosCategory: input.bazosCategory,
        productId: input.productId,
        publicDuplicateCheck: input.publicDuplicateCheck,
      });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.CONTENT_POLICY_NOT_VALIDATED)).toBe(true);
    });

    it('blocks when content policy evidence is stale', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({
        ...input,
        contentPolicy: { checkedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), source: 'manual_review' as const, passed: true },
      });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.CONTENT_POLICY_NOT_VALIDATED)).toBe(true);
    });

    it('blocks when content policy evidence is not from a trusted source', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({
        ...input,
        contentPolicy: { checkedAt: new Date(), passed: true } as any,
      });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.CONTENT_POLICY_NOT_VALIDATED)).toBe(true);
    });

    it('blocks when content policy validation fails', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate({
        ...input,
        contentPolicy: { checkedAt: new Date(), source: 'manual_review' as const, passed: false, reason: 'forbidden content' },
      });
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.CONTENT_POLICY_FAIL)).toBe(true);
    });
  });

  describe('Gate 11 — category mapping', () => {
    it('blocks when category mapping is missing', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity(), categoryMapping: null });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.failures.some((f) => f.gate === POLICY_GATE.CATEGORY_MISSING_OR_BLOCKED)).toBe(true);
    });
  });

  describe('pacing delay selection', () => {
    it('always returns a value in [60..180]', () => {
      const svc = makePolicyService({} as any);
      for (let i = 0; i < 200; i++) {
        const delay = svc.selectPacingDelaySeconds();
        expect(delay).toBeGreaterThanOrEqual(PACING_MIN_SECONDS);
        expect(delay).toBeLessThanOrEqual(PACING_MAX_SECONDS);
      }
    });

    it('returns selectedPacingDelaySeconds when policy allows', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity() });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(true);
      expect(result.selectedPacingDelaySeconds).toBeGreaterThanOrEqual(PACING_MIN_SECONDS);
      expect(result.selectedPacingDelaySeconds).toBeLessThanOrEqual(PACING_MAX_SECONDS);
    });

    it('does not return selectedPacingDelaySeconds when policy blocks', async () => {
      const prisma = makePrismaStub({ identity: baseIdentity({ status: IDENTITY_STATUS.DRAFT }) });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      expect(result.selectedPacingDelaySeconds).toBeUndefined();
    });
  });

  describe('multiple gate failures are all reported', () => {
    it('reports both cap and review-blocked when both fail', async () => {
      const prisma = makePrismaStub({
        identity: baseIdentity({
          status: IDENTITY_STATUS.VERIFIED,
          reviewState: REVIEW_STATE.SESSION_EXPIRED,
          activeAdCount: MAX_ACTIVE_ADS,
        }),
      });
      const svc = makePolicyService(prisma);
      const result = await svc.evaluate(input);
      expect(result.allowed).toBe(false);
      const gates = result.failures.map((f) => f.gate);
      expect(gates).toContain(POLICY_GATE.IDENTITY_REVIEW_BLOCKED);
      expect(gates).toContain(POLICY_GATE.ACTIVE_AD_CAP_REACHED);
    });
  });
});
