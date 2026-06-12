import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import {
  CreateBazosIdentityDto,
  UpdateBazosIdentityDto,
  MarkChallengeDto,
  MarkVerifiedDto,
} from './bazos-identity.dto';
import {
  IDENTITY_STATUS,
  REVIEW_STATE,
  SESSION_STATE,
  ReviewState,
} from './bazos-identity.types';

@Injectable()
export class BazosIdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(userId: string, dto: CreateBazosIdentityDto) {
    const existing = await this.prisma.bazosIdentity.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existing) {
      throw new ConflictException(`Phone number ${dto.phoneNumber} is already registered as a Bazos identity`);
    }

    const identity = await this.prisma.bazosIdentity.create({
      data: {
        userId,
        accountId: dto.accountId || null,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const identity = await this.prisma.bazosIdentity.findFirst({
      where: { id, userId },
      include: {
        categoryCadences: true,
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
   * Called after a human completes Bazos SMS + bank verification manually.
   * Sets status=verified so the identity can be used by the policy gate.
   */
  async markVerified(id: string, userId: string, dto: MarkVerifiedDto) {
    await this.findById(id, userId);
    const updated = await this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        status: IDENTITY_STATUS.VERIFIED,
        reviewState: REVIEW_STATE.CLEAR,
        sessionState: SESSION_STATE.ACTIVE,
        verificationExpiresAt: dto.verificationExpiresAt || null,
        notes: dto.notes,
      },
    });
    this.logger.log('Bazos identity marked verified', { identityId: id, userId });
    return updated;
  }

  /**
   * Called when Bazos presents a challenge. Stops all automation for this identity.
   * The challengeState must be one of the defined REVIEW_STATE values.
   */
  async markChallenge(id: string, dto: MarkChallengeDto) {
    const allowedChallenges: string[] = Object.values(REVIEW_STATE).filter((state) => state !== REVIEW_STATE.CLEAR);

    if (!allowedChallenges.includes(dto.challengeState)) {
      throw new BadRequestException(`Invalid challenge state: ${dto.challengeState}`);
    }

    const updated = await this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        reviewState: dto.challengeState as ReviewState,
        sessionState: SESSION_STATE.CHALLENGE,
        notes: dto.notes,
      },
    });

    this.logger.warn('Bazos identity challenge state set — automation paused', {
      identityId: id,
      challengeState: dto.challengeState,
    });
    return updated;
  }

  /**
   * Decrement active ad count after ad expires or is deleted.
   * Count never goes below 0.
   */
  async decrementActiveAdCount(id: string) {
    const identity = await this.prisma.bazosIdentity.findUnique({ where: { id } });
    if (!identity) return;
    const newCount = Math.max(0, identity.activeAdCount - 1);
    await this.prisma.bazosIdentity.update({
      where: { id },
      data: { activeAdCount: newCount },
    });
  }

  /**
   * Increment active ad count after successful publish.
   */
  async incrementActiveAdCount(id: string) {
    await this.prisma.bazosIdentity.update({
      where: { id },
      data: { activeAdCount: { increment: 1 } },
    });
  }

  /**
   * Store the notBefore timestamp for pacing before a worker begins waiting.
   * Must be called before the sleep begins so restarts cannot publish early.
   */
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

  /**
   * Update per-category cadence after successful publish.
   */
  async recordCategoryPublish(identityId: string, bazosCategory: string) {
    await this.prisma.bazosIdentityCategoryCadence.upsert({
      where: { identityId_bazosCategory: { identityId, bazosCategory } },
      create: { identityId, bazosCategory, lastPublishedAt: new Date() },
      update: { lastPublishedAt: new Date() },
    });
    this.logger.log('Category cadence recorded', { identityId, bazosCategory });
  }
}
