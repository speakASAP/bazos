import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { BazosIdentityService } from './bazos-identity.service';
import { IDENTITY_STATUS, REVIEW_STATE, SESSION_STATE } from './bazos-identity.types';

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
}

function makePrisma(overrides: Partial<{
  existing: any;
  created: any;
  found: any;
}> = {}) {
  const { existing = null, created = { id: 'id-1' }, found = { id: 'id-1', accountId: 'acc-1' } } = overrides;
  return {
    bazosIdentity: {
      findUnique: jest.fn().mockResolvedValue(existing),
      findFirst: jest.fn().mockResolvedValue(found),
      create: jest.fn().mockResolvedValue(created),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'id-1', ...data })),
      findMany: jest.fn().mockResolvedValue([]),
    },
    bazosIdentityCategoryCadence: {
      upsert: jest.fn().mockResolvedValue({}),
    },
  } as any;
}

const createDto = {
  phoneNumber: '+420777000000',
  displayName: 'Test Seller',
};

describe('BazosIdentityService', () => {
  describe('create', () => {
    it('rejects duplicate phone number', async () => {
      const prisma = makePrisma({ existing: { id: 'existing' } });
      const svc = new BazosIdentityService(prisma, makeLogger());
      await expect(svc.create('user-1', createDto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates identity with draft status and clear reviewState', async () => {
      const prisma = makePrisma({ existing: null });
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.create('user-1', createDto);
      const createCall = prisma.bazosIdentity.create.mock.calls[0][0];
      expect(createCall.data.status).toBe(IDENTITY_STATUS.DRAFT);
      expect(createCall.data.reviewState).toBe(REVIEW_STATE.CLEAR);
      expect(createCall.data.sessionState).toBe(SESSION_STATE.MISSING);
    });

    it('does not log the raw phone number', async () => {
      const prisma = makePrisma({ existing: null });
      const logger = makeLogger();
      const svc = new BazosIdentityService(prisma, logger);
      await svc.create('user-1', createDto);
      expect(logger.log).toHaveBeenCalledWith('Bazos identity created', { identityId: 'id-1', userId: 'user-1' });
    });
  });

  describe('markVerified', () => {
    it('sets status=verified, reviewState=clear, sessionState=active', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.markVerified('id-1', 'user-1', {});
      const updateCall = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe(IDENTITY_STATUS.VERIFIED);
      expect(updateCall.data.reviewState).toBe(REVIEW_STATE.CLEAR);
      expect(updateCall.data.sessionState).toBe(SESSION_STATE.ACTIVE);
    });
  });

  describe('markChallenge', () => {
    it.each([
      REVIEW_STATE.VERIFICATION_REQUIRED,
      REVIEW_STATE.BANK_VERIFICATION_REQUIRED,
      REVIEW_STATE.CAPTCHA_OR_HUMAN_CHECK_REQUIRED,
      REVIEW_STATE.SESSION_EXPIRED,
      REVIEW_STATE.BLOCKED_BY_BAZOS,
      REVIEW_STATE.DUPLICATE_REJECTED,
      REVIEW_STATE.CONTENT_POLICY_REJECTED,
      REVIEW_STATE.CATEGORY_REVIEW_REQUIRED,
    ])('accepts valid challenge state: %s', async (challengeState) => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.markChallenge('id-1', { challengeState });
      const updateCall = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(updateCall.data.reviewState).toBe(challengeState);
      expect(updateCall.data.sessionState).toBe(SESSION_STATE.CHALLENGE);
    });

    it('rejects unknown challenge state', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await expect(
        svc.markChallenge('id-1', { challengeState: 'publish_anyway' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('decrementActiveAdCount', () => {
    it('never goes below 0', async () => {
      const prisma = makePrisma();
      prisma.bazosIdentity.findUnique = jest.fn().mockResolvedValue({ id: 'id-1', activeAdCount: 0 });
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.decrementActiveAdCount('id-1');
      const updateCall = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(updateCall.data.activeAdCount).toBe(0);
    });

    it('decrements when count > 0', async () => {
      const prisma = makePrisma();
      prisma.bazosIdentity.findUnique = jest.fn().mockResolvedValue({ id: 'id-1', activeAdCount: 3 });
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.decrementActiveAdCount('id-1');
      const updateCall = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(updateCall.data.activeAdCount).toBe(2);
    });
  });

  describe('reservePublishSlot', () => {
    it('persists notBefore before worker sleeps', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      const notBefore = new Date(Date.now() + 90_000);
      await svc.reservePublishSlot('id-1', notBefore);
      const updateCall = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(updateCall.data.nextPublishNotBefore).toEqual(notBefore);
      expect(updateCall.data.lastPublishAttemptAt).toBeInstanceOf(Date);
    });
  });

  describe('recordCategoryPublish', () => {
    it('upserts category cadence', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.recordCategoryPublish('id-1', 'elektro');
      expect(prisma.bazosIdentityCategoryCadence.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { identityId_bazosCategory: { identityId: 'id-1', bazosCategory: 'elektro' } },
        }),
      );
    });
  });
});
