import { BadRequestException, ConflictException } from '@nestjs/common';
import { BazosIdentityService } from './bazos-identity.service';
import {
  IDENTITY_STATUS,
  REVIEW_STATE,
  SESSION_STATE,
  VERIFICATION_SESSION_STATE,
} from './bazos-identity.types';

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
}

const verificationSession = {
  id: 'session-1',
  identityId: 'id-1',
  state: VERIFICATION_SESSION_STATE.AWAITING_HUMAN,
  expiresAt: new Date(Date.now() + 60_000),
  notes: null,
};

function makePrisma(overrides: Partial<{
  existing: any;
  created: any;
  found: any;
  verificationSession: any;
}> = {}) {
  const {
    existing = null,
    created = { id: 'id-1' },
    found = { id: 'id-1', accountId: 'acc-1' },
    verificationSession: session = verificationSession,
  } = overrides;
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
    bazosVerificationSession: {
      create: jest.fn().mockResolvedValue({ id: 'session-1' }),
      findFirst: jest.fn().mockResolvedValue(session),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'session-1', ...data })),
    },
  } as any;
}

const createDto = {
  phoneNumber: '+420777000000',
  displayName: 'Test Seller',
};

const encryptedSession = {
  ciphertext: 'encrypted-session-state',
  iv: 'iv-value',
  authTag: 'auth-tag',
  algorithm: 'aes-256-gcm',
  keyRef: 'vault://bazos/session-key',
  capturedAt: '2026-06-12T12:00:00.000Z',
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

  describe('verification sessions', () => {
    it('starts an awaiting-human setup session and marks identity verification-required', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.startVerificationSession('id-1', 'user-1', { verificationUrl: 'https://www.bazos.cz/' });

      expect(prisma.bazosVerificationSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identityId: 'id-1',
            state: VERIFICATION_SESSION_STATE.AWAITING_HUMAN,
            operatorUserId: 'user-1',
          }),
        }),
      );
      const identityUpdate = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(identityUpdate.data.status).toBe(IDENTITY_STATUS.DRAFT);
      expect(identityUpdate.data.reviewState).toBe(REVIEW_STATE.VERIFICATION_REQUIRED);
      expect(identityUpdate.data.sessionState).toBe(SESSION_STATE.MISSING);
    });

    it('completes only after human confirmation and stores encrypted session envelope', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.completeVerificationSession('id-1', 'session-1', 'user-1', {
        humanConfirmed: true,
        encryptedSession,
        verificationExpiresAt: '2027-06-12T12:00:00.000Z',
      });

      const sessionUpdate = prisma.bazosVerificationSession.update.mock.calls[0][0];
      expect(sessionUpdate.data.state).toBe(VERIFICATION_SESSION_STATE.COMPLETED);
      expect(sessionUpdate.data.humanConfirmed).toBe(true);
      expect(sessionUpdate.data.evidence.encryptedSessionEnvelope.ciphertextPresent).toBe(true);
      expect(sessionUpdate.data.evidence.encryptedSessionEnvelope.ciphertext).toBeUndefined();

      const identityUpdate = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(identityUpdate.data.status).toBe(IDENTITY_STATUS.VERIFIED);
      expect(identityUpdate.data.reviewState).toBe(REVIEW_STATE.CLEAR);
      expect(identityUpdate.data.sessionState).toBe(SESSION_STATE.ACTIVE);
      expect(identityUpdate.data.encryptedSession).toEqual(encryptedSession);
    });

    it('rejects completion without human confirmation', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await expect(
        svc.completeVerificationSession('id-1', 'session-1', 'user-1', {
          humanConfirmed: false,
          encryptedSession,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects raw cookie or verification secret fields in the session envelope', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await expect(
        svc.completeVerificationSession('id-1', 'session-1', 'user-1', {
          humanConfirmed: true,
          encryptedSession: { ...encryptedSession, rawCookies: 'bazos-cookie' } as any,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('does not complete a challenged session', async () => {
      const prisma = makePrisma({
        verificationSession: { ...verificationSession, state: VERIFICATION_SESSION_STATE.CHALLENGE_DETECTED },
      });
      const svc = new BazosIdentityService(prisma, makeLogger());
      await expect(
        svc.completeVerificationSession('id-1', 'session-1', 'user-1', {
          humanConfirmed: true,
          encryptedSession,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('records verification challenge and moves identity to manual review', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.recordVerificationChallenge('id-1', 'session-1', 'user-1', {
        challengeState: REVIEW_STATE.CAPTCHA_OR_HUMAN_CHECK_REQUIRED,
      });

      const sessionUpdate = prisma.bazosVerificationSession.update.mock.calls[0][0];
      expect(sessionUpdate.data.state).toBe(VERIFICATION_SESSION_STATE.CHALLENGE_DETECTED);
      expect(sessionUpdate.data.challengeType).toBe(REVIEW_STATE.CAPTCHA_OR_HUMAN_CHECK_REQUIRED);

      const identityUpdate = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(identityUpdate.data.reviewState).toBe(REVIEW_STATE.CAPTCHA_OR_HUMAN_CHECK_REQUIRED);
      expect(identityUpdate.data.sessionState).toBe(SESSION_STATE.CHALLENGE);
    });

    it('expires setup session and marks identity session-expired', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.expireVerificationSession('id-1', 'session-1', 'user-1', {});

      const sessionUpdate = prisma.bazosVerificationSession.update.mock.calls[0][0];
      expect(sessionUpdate.data.state).toBe(VERIFICATION_SESSION_STATE.EXPIRED);
      expect(sessionUpdate.data.challengeType).toBe(REVIEW_STATE.SESSION_EXPIRED);

      const identityUpdate = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(identityUpdate.data.reviewState).toBe(REVIEW_STATE.SESSION_EXPIRED);
      expect(identityUpdate.data.sessionState).toBe(SESSION_STATE.EXPIRED);
    });
  });

  describe('markVerified', () => {
    it('sets status=verified, reviewState=clear, sessionState=active only with human encrypted evidence', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await svc.markVerified('id-1', 'user-1', { humanConfirmed: true, encryptedSession });
      const updateCall = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe(IDENTITY_STATUS.VERIFIED);
      expect(updateCall.data.reviewState).toBe(REVIEW_STATE.CLEAR);
      expect(updateCall.data.sessionState).toBe(SESSION_STATE.ACTIVE);
      expect(updateCall.data.encryptedSession).toEqual(encryptedSession);
    });

    it('rejects mark-verified without encrypted session evidence', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await expect(
        svc.markVerified('id-1', 'user-1', { humanConfirmed: true } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
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
      await svc.markChallenge('id-1', 'user-1', { challengeState });
      const updateCall = prisma.bazosIdentity.update.mock.calls[0][0];
      expect(updateCall.data.reviewState).toBe(challengeState);
      expect(updateCall.data.sessionState).toBe(
        challengeState === REVIEW_STATE.SESSION_EXPIRED ? SESSION_STATE.EXPIRED : SESSION_STATE.CHALLENGE,
      );
    });

    it('rejects unknown challenge state', async () => {
      const prisma = makePrisma();
      const svc = new BazosIdentityService(prisma, makeLogger());
      await expect(
        svc.markChallenge('id-1', 'user-1', { challengeState: 'publish_anyway' }),
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
