import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import {
  CompleteManualVerificationSessionDto,
  CompleteVerificationSessionDto,
  CreateBazosIdentityDto,
  ExpireVerificationSessionDto,
  MarkChallengeDto,
  MarkVerifiedDto,
  StartVerificationSessionDto,
  UpdateBazosIdentityDto,
  VerificationSessionChallengeDto,
} from './bazos-identity.dto';
import {
  EncryptedBazosSessionEnvelope,
  IDENTITY_STATUS,
  REVIEW_STATE,
  SESSION_STATE,
  VERIFICATION_SESSION_STATE,
  ReviewState,
} from './bazos-identity.types';

const DEFAULT_VERIFICATION_SESSION_MINUTES = 30;
const DEFAULT_BAZOS_VERIFICATION_URL = 'https://www.bazos.cz/';
const FORBIDDEN_SESSION_KEYS = new Set([
  'cookie',
  'cookies',
  'rawcookie',
  'rawcookies',
  'sessioncookie',
  'sessioncookies',
  'password',
  'verificationcode',
  'smscode',
  'bankcode',
  'paymentdetails',
  'paymentcard',
]);

@Injectable()
export class BazosIdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(userId: string, dto: CreateBazosIdentityDto, userEmail?: string) {
    const existing = await this.prisma.bazosIdentity.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existing) {
      throw new ConflictException(`Phone number ${dto.phoneNumber} is already registered as a Bazos identity`);
    }

    const accountId = dto.accountId || await this.ensureAccountForUser(dto.displayName, userEmail);

    const identity = await this.prisma.bazosIdentity.create({
      data: {
        userId,
        accountId,
        phoneNumber: dto.phoneNumber,
        displayName: dto.displayName,
        contactName: dto.contactName || null,
        contactPhone: dto.contactPhone || null,
        defaultZip: dto.defaultZip || null,
        defaultLocation: dto.defaultLocation || null,
        status: IDENTITY_STATUS.DRAFT,
        reviewState: REVIEW_STATE.CLEAR,
        sessionState: SESSION_STATE.MISSING,
        notes: dto.notes || null,
      },
    });

    this.logger.log('Bazos identity created', { identityId: identity.id, userId });
    return identity;
  }

  async findAllForUser(userId: string) {
    return this.prisma.bazosIdentity.findMany({
      where: { userId },
      include: {
        verificationSessions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const identity = await this.prisma.bazosIdentity.findFirst({
      where: { id, userId },
      include: {
        categoryCadences: true,
        verificationSessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!identity) throw new NotFoundException('Bazos identity not found');
    return identity;
  }

  async update(id: string, userId: string, dto: UpdateBazosIdentityDto) {
    await this.findById(id, userId);
    return this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        displayName: dto.displayName,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        defaultZip: dto.defaultZip,
        defaultLocation: dto.defaultLocation,
        notes: dto.notes,
      },
    });
  }

  /**
   * Starts a bounded setup record for a human-operated Bazos browser/session flow.
   * This does not automate SMS, bank verification, CAPTCHA, or device checks.
   */
  async startVerificationSession(id: string, userId: string, dto: StartVerificationSessionDto = {}) {
    await this.findById(id, userId);
    const expiresAt = this.toDate(dto.expiresAt) || new Date(Date.now() + DEFAULT_VERIFICATION_SESSION_MINUTES * 60_000);
    const session = await this.prisma.bazosVerificationSession.create({
      data: {
        identityId: id,
        state: VERIFICATION_SESSION_STATE.AWAITING_HUMAN,
        verificationUrl: dto.verificationUrl || DEFAULT_BAZOS_VERIFICATION_URL,
        operatorUserId: userId,
        expiresAt,
        notes: dto.notes || null,
      },
    });

    await this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        status: IDENTITY_STATUS.DRAFT,
        reviewState: REVIEW_STATE.VERIFICATION_REQUIRED,
        sessionState: SESSION_STATE.MISSING,
      },
    });

    this.logger.log('Bazos verification session started', { identityId: id, sessionId: session.id, userId });
    return session;
  }

  /**
   * Completes a human verification session only after explicit human confirmation
   * and an encrypted session envelope. Raw cookies/codes/passwords are rejected.
   */
  async completeVerificationSession(
    id: string,
    sessionId: string,
    userId: string,
    dto: CompleteVerificationSessionDto,
  ) {
    await this.findById(id, userId);
    const session = await this.getAwaitingVerificationSession(id, sessionId);

    if (session.expiresAt && session.expiresAt <= new Date()) {
      await this.expireVerificationSession(id, sessionId, userId, { notes: 'Verification session expired before completion' });
      throw new BadRequestException('Verification session has expired');
    }
    if (dto.humanConfirmed !== true) {
      throw new BadRequestException('Human confirmation is required before storing Bazos session state');
    }

    this.validateEncryptedSessionEnvelope(dto.encryptedSession);
    const verificationExpiresAt = this.toDate(dto.verificationExpiresAt);

    const updatedSession = await this.prisma.bazosVerificationSession.update({
      where: { id: sessionId },
      data: {
        state: VERIFICATION_SESSION_STATE.COMPLETED,
        humanConfirmed: true,
        evidence: {
          encryptedSessionEnvelope: this.describeEnvelope(dto.encryptedSession),
          humanConfirmed: true,
        },
        completedAt: new Date(),
        notes: dto.notes || session.notes,
      },
    });

    await this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        status: IDENTITY_STATUS.VERIFIED,
        reviewState: REVIEW_STATE.CLEAR,
        sessionState: SESSION_STATE.ACTIVE,
        encryptedSession: this.toEncryptedSessionJson(dto.encryptedSession),
        verificationExpiresAt: verificationExpiresAt || null,
        notes: dto.notes,
      },
    });

    this.logger.log('Bazos verification session completed by human', { identityId: id, sessionId, userId });
    return updatedSession;
  }

  async completeManualVerificationSession(
    id: string,
    sessionId: string,
    userId: string,
    userEmail: string | undefined,
    dto: CompleteManualVerificationSessionDto,
  ) {
    await this.findById(id, userId);
    const session = await this.getAwaitingVerificationSession(id, sessionId);

    if (session.expiresAt && session.expiresAt <= new Date()) {
      await this.expireVerificationSession(id, sessionId, userId, { notes: 'Verification session expired before manual completion' });
      throw new BadRequestException('Verification session has expired');
    }
    if (dto.humanConfirmed !== true) {
      throw new BadRequestException('Human confirmation is required before marking Bazos verification complete');
    }

    const verificationExpiresAt = this.toDate(dto.verificationExpiresAt);
    const accountId = await this.ensureAccountForIdentity(id, userEmail);

    const updatedSession = await this.prisma.bazosVerificationSession.update({
      where: { id: sessionId },
      data: {
        state: VERIFICATION_SESSION_STATE.COMPLETED,
        humanConfirmed: true,
        evidence: {
          manualBrowserVerification: true,
          verificationUrl: session.verificationUrl,
          phoneVerificationHandledBy: 'bazos.cz',
          serverSideBazosRequestsAllowed: false,
          capturedAt: new Date().toISOString(),
        },
        completedAt: new Date(),
        notes: dto.notes || session.notes,
      },
    });

    await this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        accountId,
        status: IDENTITY_STATUS.VERIFIED,
        reviewState: REVIEW_STATE.CLEAR,
        sessionState: SESSION_STATE.ACTIVE,
        verificationExpiresAt: verificationExpiresAt || null,
        notes: dto.notes,
      },
    });

    this.logger.log('Bazos identity manually verified after human browser verification', { identityId: id, sessionId, userId });
    return updatedSession;
  }

  async recordVerificationChallenge(
    id: string,
    sessionId: string,
    userId: string,
    dto: VerificationSessionChallengeDto,
  ) {
    await this.findById(id, userId);
    await this.getAwaitingVerificationSession(id, sessionId);
    const challengeState = this.assertChallengeState(dto.challengeState);

    const updatedSession = await this.prisma.bazosVerificationSession.update({
      where: { id: sessionId },
      data: {
        state: VERIFICATION_SESSION_STATE.CHALLENGE_DETECTED,
        challengeType: challengeState,
        notes: dto.notes || null,
      },
    });

    await this.applyIdentityChallengeState(id, challengeState, dto.notes);
    this.logger.warn('Bazos verification challenge recorded — automation paused', {
      identityId: id,
      sessionId,
      challengeState,
    });
    return updatedSession;
  }

  async expireVerificationSession(
    id: string,
    sessionId: string,
    userId: string,
    dto: ExpireVerificationSessionDto = {},
  ) {
    await this.findById(id, userId);
    const session = await this.prisma.bazosVerificationSession.findFirst({
      where: { id: sessionId, identityId: id },
    });
    if (!session) throw new NotFoundException('Bazos verification session not found');
    if (session.state === VERIFICATION_SESSION_STATE.COMPLETED) {
      throw new BadRequestException('Completed verification sessions cannot be expired');
    }

    const updatedSession = await this.prisma.bazosVerificationSession.update({
      where: { id: sessionId },
      data: {
        state: VERIFICATION_SESSION_STATE.EXPIRED,
        challengeType: REVIEW_STATE.SESSION_EXPIRED,
        notes: dto.notes || session.notes,
      },
    });

    await this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        reviewState: REVIEW_STATE.SESSION_EXPIRED,
        sessionState: SESSION_STATE.EXPIRED,
        notes: dto.notes,
      },
    });

    this.logger.warn('Bazos verification session expired — automation paused', { identityId: id, sessionId });
    return updatedSession;
  }

  /** Called after a human completes Bazos SMS + bank verification manually. */
  async markVerified(id: string, userId: string, dto: MarkVerifiedDto) {
    await this.findById(id, userId);
    if (dto.humanConfirmed !== true) {
      throw new BadRequestException('Human confirmation is required before marking a Bazos identity verified');
    }
    this.validateEncryptedSessionEnvelope(dto.encryptedSession);

    const verificationExpiresAt = this.toDate(dto.verificationExpiresAt);
    const session = await this.prisma.bazosVerificationSession.create({
      data: {
        identityId: id,
        state: VERIFICATION_SESSION_STATE.COMPLETED,
        operatorUserId: userId,
        humanConfirmed: true,
        evidence: {
          encryptedSessionEnvelope: this.describeEnvelope(dto.encryptedSession),
          humanConfirmed: true,
        },
        completedAt: new Date(),
        notes: dto.notes || null,
      },
    });

    const updated = await this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        status: IDENTITY_STATUS.VERIFIED,
        reviewState: REVIEW_STATE.CLEAR,
        sessionState: SESSION_STATE.ACTIVE,
        encryptedSession: this.toEncryptedSessionJson(dto.encryptedSession),
        verificationExpiresAt: verificationExpiresAt || null,
        notes: dto.notes,
      },
    });
    this.logger.log('Bazos identity marked verified after human verification', { identityId: id, sessionId: session.id, userId });
    return updated;
  }

  /** Called when Bazos presents a challenge. Stops all automation for this identity. */
  async markChallenge(id: string, userId: string, dto: MarkChallengeDto) {
    await this.findById(id, userId);
    const challengeState = this.assertChallengeState(dto.challengeState);
    const updated = await this.applyIdentityChallengeState(id, challengeState, dto.notes);

    this.logger.warn('Bazos identity challenge state set — automation paused', {
      identityId: id,
      challengeState,
    });
    return updated;
  }

  /** Decrement active ad count after ad expires or is deleted. Count never goes below 0. */
  async decrementActiveAdCount(id: string) {
    const identity = await this.prisma.bazosIdentity.findUnique({ where: { id } });
    if (!identity) return;
    const newCount = Math.max(0, identity.activeAdCount - 1);
    await this.prisma.bazosIdentity.update({
      where: { id },
      data: { activeAdCount: newCount },
    });
  }

  /** Increment active ad count after successful publish. */
  async incrementActiveAdCount(id: string) {
    await this.prisma.bazosIdentity.update({
      where: { id },
      data: { activeAdCount: { increment: 1 } },
    });
  }

  /** Store the notBefore timestamp for pacing before a worker begins waiting. */
  async reservePublishSlot(id: string, notBefore: Date) {
    await this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        nextPublishNotBefore: notBefore,
        lastPublishAttemptAt: new Date(),
      },
    });
    this.logger.log('Publish slot reserved', { identityId: id, notBefore: notBefore.toISOString() });
  }

  /** Update per-category cadence after successful publish. */
  async recordCategoryPublish(identityId: string, bazosCategory: string) {
    await this.prisma.bazosIdentityCategoryCadence.upsert({
      where: { identityId_bazosCategory: { identityId, bazosCategory } },
      create: { identityId, bazosCategory, lastPublishedAt: new Date() },
      update: { lastPublishedAt: new Date() },
    });
    this.logger.log('Category cadence recorded', { identityId, bazosCategory });
  }

  private async ensureAccountForIdentity(identityId: string, userEmail?: string): Promise<string | null> {
    const identity = await this.prisma.bazosIdentity.findUnique({ where: { id: identityId } });
    if (identity?.accountId) return identity.accountId;
    return this.ensureAccountForUser(identity?.displayName, userEmail);
  }

  private async ensureAccountForUser(displayName?: string | null, userEmail?: string): Promise<string | null> {
    const email = String(userEmail || '').trim().toLowerCase();
    if (!email) return null;

    const existing = await this.prisma.bazosAccount.findFirst({
      where: { email },
      orderBy: { createdAt: 'asc' },
    });
    if (existing) return existing.id;

    const account = await this.prisma.bazosAccount.create({
      data: {
        name: displayName || email,
        email,
        password: null,
        isActive: true,
      },
    });
    return account.id;
  }

  private async getAwaitingVerificationSession(identityId: string, sessionId: string) {
    const session = await this.prisma.bazosVerificationSession.findFirst({
      where: { id: sessionId, identityId },
    });
    if (!session) throw new NotFoundException('Bazos verification session not found');
    if (session.state !== VERIFICATION_SESSION_STATE.AWAITING_HUMAN) {
      throw new BadRequestException(`Verification session state is "${session.state}", must be "awaiting_human"`);
    }
    return session;
  }

  private assertChallengeState(challengeState: string): ReviewState {
    const allowedChallenges: string[] = Object.values(REVIEW_STATE).filter((state) => state !== REVIEW_STATE.CLEAR);
    if (!allowedChallenges.includes(challengeState)) {
      throw new BadRequestException(`Invalid challenge state: ${challengeState}`);
    }
    return challengeState as ReviewState;
  }

  private async applyIdentityChallengeState(id: string, challengeState: ReviewState, notes?: string) {
    return this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        reviewState: challengeState,
        sessionState: challengeState === REVIEW_STATE.SESSION_EXPIRED ? SESSION_STATE.EXPIRED : SESSION_STATE.CHALLENGE,
        notes,
      },
    });
  }

  private validateEncryptedSessionEnvelope(envelope: EncryptedBazosSessionEnvelope) {
    if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
      throw new BadRequestException('Encrypted Bazos session envelope is required');
    }
    this.rejectForbiddenSessionKeys(envelope);

    for (const key of ['ciphertext', 'iv', 'authTag', 'algorithm', 'keyRef', 'capturedAt'] as const) {
      if (typeof envelope[key] !== 'string' || envelope[key].trim().length === 0) {
        throw new BadRequestException(`Encrypted Bazos session envelope is missing ${key}`);
      }
    }
  }

  private rejectForbiddenSessionKeys(value: unknown, path = 'encryptedSession') {
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const normalizedKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (FORBIDDEN_SESSION_KEYS.has(normalizedKey)) {
        throw new BadRequestException(`Raw Bazos session or verification secret field is not allowed: ${path}.${key}`);
      }
      this.rejectForbiddenSessionKeys(nested, `${path}.${key}`);
    }
  }

  private toEncryptedSessionJson(envelope: EncryptedBazosSessionEnvelope): Record<string, string> {
    return { ...envelope };
  }

  private describeEnvelope(envelope: EncryptedBazosSessionEnvelope) {
    return {
      algorithm: envelope.algorithm,
      keyRef: envelope.keyRef,
      capturedAt: envelope.capturedAt,
      ciphertextPresent: Boolean(envelope.ciphertext),
      ivPresent: Boolean(envelope.iv),
      authTagPresent: Boolean(envelope.authTag),
    };
  }

  private toDate(value?: Date | string | null): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date value');
    }
    return date;
  }
}
