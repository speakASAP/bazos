import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { BazosIdentityService } from '../identity/bazos-identity.service';
import { REVIEW_STATE, SESSION_STATE } from '../identity/bazos-identity.types';
import { PublishPolicyService } from '../policy/publish-policy.service';
import {
  ClaimBazosPublishDto,
  EnqueueBazosPublishDto,
  ListBazosPublishQueueDto,
  RecordBazosPublishResultDto,
} from './bazos-publisher-queue.dto';

const ACTIVE_ATTEMPT_STATUSES = ['queued', 'submitting'];
const TERMINAL_ATTEMPT_STATUSES = ['submitted', 'challenge_required', 'failed', 'policy_blocked'];
const BAZOS_EDIT_PASSWORD_PREFIX = 'bz';

@Injectable()
export class BazosPublisherQueueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly policy: PublishPolicyService,
    private readonly identities: BazosIdentityService,
  ) {}

  async enqueueDraft(adId: string, userId: string, dto: EnqueueBazosPublishDto) {
    const ad = await this.findAdForUser(adId, userId);
    this.assertPublishableDraft(ad);

    const existing = await this.prisma.bazosPublishAttempt.findFirst({
      where: {
        adId,
        identityId: ad.identityId,
        status: { in: ACTIVE_ATTEMPT_STATUSES },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      return { queued: true, idempotent: true, attempt: existing };
    }

    const policyResult = this.withSubmissionOptions(await this.evaluateAdPolicy(ad, dto), ad, dto.priceOption);
    await this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: { lastPolicyCheck: policyResult as any },
    });

    if (!policyResult.allowed) {
      const attempt = await this.prisma.bazosPublishAttempt.create({
        data: {
          identityId: ad.identityId,
          adId: ad.id,
          productId: ad.productId,
          status: 'policy_blocked',
          policyResult: policyResult as any,
          completedAt: new Date(),
        },
      });
      this.logger.warn('Bazos publish enqueue blocked by policy', {
        attemptId: attempt.id,
        adId: ad.id,
        identityId: ad.identityId,
        failureGates: policyResult.failures.map((failure) => failure.gate),
      });
      return { queued: false, decision: policyResult, attempt };
    }

    const notBefore = new Date(policyResult.evaluatedAt.getTime() + policyResult.selectedPacingDelaySeconds * 1000);
    await this.identities.reservePublishSlot(ad.identityId, notBefore);

    const attempt = await this.prisma.bazosPublishAttempt.create({
      data: {
        identityId: ad.identityId,
        adId: ad.id,
        productId: ad.productId,
        status: 'queued',
        policyResult: policyResult as any,
        notBefore,
      },
    });

    await this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: { publishStatus: 'queued' },
    });

    this.logger.log('Bazos publish attempt queued', {
      attemptId: attempt.id,
      adId: ad.id,
      identityId: ad.identityId,
      notBefore: notBefore.toISOString(),
    });

    return { queued: true, idempotent: false, attempt, decision: policyResult };
  }

  async listQueue(userId: string, query: ListBazosPublishQueueDto = {}) {
    const identityIds = await this.identityIdsForUser(userId);
    return this.prisma.bazosPublishAttempt.findMany({
      where: {
        identityId: { in: query.identityId ? [query.identityId] : identityIds },
        status: query.status || undefined,
        adId: query.adId,
      },
      include: { ad: true, identity: true },
      orderBy: [{ notBefore: 'asc' }, { createdAt: 'asc' }],
      take: Number(query.limit || 50),
    });
  }

  async claimNext(userId: string, dto: ClaimBazosPublishDto) {
    const identityIds = await this.identityIdsForUser(userId);
    const now = new Date();
    const attempts = await this.prisma.bazosPublishAttempt.findMany({
      where: {
        identityId: { in: identityIds },
        status: 'queued',
        OR: [{ notBefore: null }, { notBefore: { lte: now } }],
      },
      include: { ad: true, identity: true },
      orderBy: [{ notBefore: 'asc' }, { createdAt: 'asc' }],
      take: Number(dto.limit || 5),
    });

    for (const attempt of attempts) {
      if (!attempt.ad || !attempt.ad.isActive) continue;
      const activeForIdentity = await this.prisma.bazosPublishAttempt.findFirst({
        where: {
          identityId: attempt.identityId,
          status: 'submitting',
          id: { not: attempt.id },
        },
      });
      if (activeForIdentity) continue;

      const policyResult = this.withSubmissionOptions(await this.evaluateAdPolicy(attempt.ad, dto), attempt.ad, dto.priceOption || this.submissionOptions(attempt).priceOption);
      if (!policyResult.allowed) {
        await this.prisma.bazosPublishAttempt.update({
          where: { id: attempt.id },
          data: {
            status: 'policy_blocked',
            policyResult: policyResult as any,
            completedAt: new Date(),
          },
        });
        await this.prisma.bazosAd.update({
          where: { id: attempt.ad.id },
          data: { publishStatus: 'blocked_policy', lastPolicyCheck: policyResult as any },
        });
        this.logger.warn('Bazos publish claim blocked by policy re-check', {
          attemptId: attempt.id,
          adId: attempt.ad.id,
          identityId: attempt.identityId,
          failureGates: policyResult.failures.map((failure) => failure.gate),
        });
        return { claimed: false, reason: 'policy_blocked', decision: policyResult };
      }

      const claimed = await this.prisma.bazosPublishAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'submitting',
          startedAt: new Date(),
          policyResult: policyResult as any,
        },
        include: { ad: true, identity: true },
      });
      await this.prisma.bazosAd.update({
        where: { id: attempt.ad.id },
        data: { publishStatus: 'publishing', lastPolicyCheck: policyResult as any },
      });

      const adWithPassword = await this.ensureAdEditPassword(claimed.ad);
      return {
        claimed: true,
        attempt: claimed,
        submission: this.buildSubmissionPacket({ ...claimed, ad: adWithPassword }),
      };
    }

    return { claimed: false, reason: 'no_due_attempts' };
  }

  async submissionForAttempt(attemptId: string, userId: string) {
    const attempt = await this.prisma.bazosPublishAttempt.findFirst({
      where: { id: attemptId, identity: { userId } },
      include: { ad: true, identity: true },
    });
    if (!attempt) throw new NotFoundException('Bazos publish attempt not found');
    if (!['queued', 'submitting'].includes(attempt.status)) {
      throw new BadRequestException(`Publish attempt is not active: ${attempt.status}`);
    }
    if (!attempt.ad || !attempt.ad.isActive) {
      throw new BadRequestException('Publish attempt has no active ad to submit');
    }
    const adWithPassword = await this.ensureAdEditPassword(attempt.ad);
    return {
      attempt,
      submission: this.buildSubmissionPacket({ ...attempt, ad: adWithPassword }),
    };
  }

  async recordResult(attemptId: string, userId: string, dto: RecordBazosPublishResultDto) {
    const attempt = await this.prisma.bazosPublishAttempt.findFirst({
      where: { id: attemptId, identity: { userId } },
      include: { ad: true, identity: true },
    });
    if (!attempt) throw new NotFoundException('Bazos publish attempt not found');
    if (TERMINAL_ATTEMPT_STATUSES.includes(attempt.status)) {
      throw new BadRequestException(`Publish attempt is already terminal: ${attempt.status}`);
    }
    if (dto.success && !dto.bazosAdId) {
      throw new BadRequestException('bazosAdId is required for successful publish results');
    }
    if (!dto.success && dto.challengeState) {
      return this.recordChallengeResult(attempt, dto);
    }
    if (!dto.success) {
      return this.recordFailedResult(attempt, dto.error);
    }
    return this.recordSuccessfulResult(attempt, dto);
  }

  private async recordSuccessfulResult(attempt: any, dto: RecordBazosPublishResultDto) {
    const completedAt = new Date();
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    const updatedAttempt = await this.prisma.bazosPublishAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'submitted',
        completedAt,
        error: null,
      },
      include: { ad: true, identity: true },
    });

    if (attempt.ad) {
      await this.prisma.bazosAd.update({
        where: { id: attempt.ad.id },
        data: {
          bazosAdId: dto.bazosAdId,
          expiresAt,
          publishStatus: 'published',
          challengeState: null,
          lastPublishedAt: completedAt,
        },
      });
      await this.identities.incrementActiveAdCount(attempt.identityId);
      if (attempt.ad.category) {
        await this.identities.recordCategoryPublish(attempt.identityId, attempt.ad.category);
      }
    }

    this.logger.log('Bazos publish attempt succeeded', {
      attemptId: attempt.id,
      adId: attempt.adId,
      identityId: attempt.identityId,
    });
    return updatedAttempt;
  }

  private async recordChallengeResult(attempt: any, dto: RecordBazosPublishResultDto) {
    const challengeState = this.assertChallengeState(dto.challengeState);
    const updatedAttempt = await this.prisma.bazosPublishAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'challenge_required',
        challengeState,
        completedAt: new Date(),
        error: dto.error,
      },
      include: { ad: true, identity: true },
    });

    if (attempt.ad) {
      await this.prisma.bazosAd.update({
        where: { id: attempt.ad.id },
        data: {
          publishStatus: 'challenge',
          challengeState,
        },
      });
    }
    await this.prisma.bazosIdentity.update({
      where: { id: attempt.identityId },
      data: {
        reviewState: challengeState,
        sessionState: challengeState === REVIEW_STATE.SESSION_EXPIRED ? SESSION_STATE.EXPIRED : SESSION_STATE.CHALLENGE,
      },
    });

    this.logger.warn('Bazos publish attempt stopped on challenge', {
      attemptId: attempt.id,
      adId: attempt.adId,
      identityId: attempt.identityId,
      challengeState,
    });
    return updatedAttempt;
  }

  private async recordFailedResult(attempt: any, error?: string) {
    const updatedAttempt = await this.prisma.bazosPublishAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error,
      },
      include: { ad: true, identity: true },
    });
    if (attempt.ad) {
      await this.prisma.bazosAd.update({
        where: { id: attempt.ad.id },
        data: { publishStatus: 'failed' },
      });
    }
    this.logger.warn('Bazos publish attempt failed without challenge bypass', {
      attemptId: attempt.id,
      adId: attempt.adId,
      identityId: attempt.identityId,
      error,
    });
    return updatedAttempt;
  }

  private async findAdForUser(adId: string, userId: string) {
    const ad = await this.prisma.bazosAd.findFirst({
      where: { id: adId, identity: { userId } },
      include: { identity: true },
    });
    if (!ad) throw new NotFoundException('Bazos ad not found');
    return ad;
  }

  private assertPublishableDraft(ad: any) {
    if (!ad.identityId) throw new BadRequestException('Ad has no linked Bazos identity');
    if (!ad.category) throw new BadRequestException('Ad must have a Bazos category before publishing');
    if (ad.bazosAdId || ['published', 'publishing'].includes(ad.publishStatus)) {
      throw new BadRequestException('Ad is already published or currently submitting');
    }
    if (!ad.isActive) throw new BadRequestException('Inactive ads cannot be published');
  }

  private async evaluateAdPolicy(ad: any, evidence: PublishEvidenceDto) {
    return this.policy.evaluate({
      identityId: ad.identityId,
      bazosCategory: ad.category,
      productId: ad.productId || undefined,
      adId: ad.id,
      adTitle: ad.title,
      publicDuplicateCheck: evidence.publicDuplicateCheck
        ? {
            checkedAt: new Date(evidence.publicDuplicateCheck.checkedAt),
            source: evidence.publicDuplicateCheck.source,
            likelyDuplicate: evidence.publicDuplicateCheck.likelyDuplicate,
            reason: evidence.publicDuplicateCheck.reason,
          }
        : undefined,
      contentPolicy: evidence.contentPolicy
        ? {
            checkedAt: new Date(evidence.contentPolicy.checkedAt),
            source: evidence.contentPolicy.source,
            passed: evidence.contentPolicy.passed,
            reason: evidence.contentPolicy.reason,
          }
        : undefined,
    });
  }

  private buildSubmissionPacket(attempt: any) {
    const ad = attempt.ad;
    const identity = attempt.identity;
    return {
      targetUrl: 'https://www.bazos.cz/pridat-inzerat.php',
      requiresVerifiedHumanSession: true,
      requiresOperatorBrowser: true,
      serverSideBazosRequestsAllowed: false,
      mustNotSpoofNetworkOrigin: true,
      stopOnChallenges: [
        REVIEW_STATE.VERIFICATION_REQUIRED,
        REVIEW_STATE.BANK_VERIFICATION_REQUIRED,
        REVIEW_STATE.CAPTCHA_OR_HUMAN_CHECK_REQUIRED,
        REVIEW_STATE.SESSION_EXPIRED,
        REVIEW_STATE.BLOCKED_BY_BAZOS,
        REVIEW_STATE.DUPLICATE_REJECTED,
        REVIEW_STATE.CONTENT_POLICY_REJECTED,
        REVIEW_STATE.CATEGORY_REVIEW_REQUIRED,
      ],
      prohibitedAutomation: ['sms_bypass', 'bank_check_bypass', 'captcha_solving', 'device_spoofing', 'rate_limit_bypass'],
      identity: {
        id: identity.id,
        displayName: identity.displayName,
        contactName: identity.contactName,
        contactPhone: identity.contactPhone || identity.phoneNumber,
        defaultZip: identity.defaultZip,
        defaultLocation: identity.defaultLocation,
      },
      ad: {
        id: ad.id,
        productId: ad.productId,
        title: ad.title,
        description: ad.description,
        price: ad.price,
        editPassword: ad.bazosEditPassword,
        category: ad.category,
        location: ad.location || identity.defaultLocation,
        rubric: this.submissionOptions(attempt).rubric,
        priceOption: this.submissionOptions(attempt).priceOption,
        media: this.submissionOptions(attempt).media,
      },
    };
  }


  private async ensureAdEditPassword(ad: any) {
    if (ad?.bazosEditPassword) return ad;
    const password = this.generateEditPassword();
    return this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: { bazosEditPassword: password },
    });
  }

  private generateEditPassword() {
    return `${BAZOS_EDIT_PASSWORD_PREFIX}-${randomBytes(12).toString('base64url')}`;
  }

  private submissionOptions(attempt: any) {
    const policyOptions = attempt?.policyResult?.submissionOptions || {};
    const draftOptions = attempt?.ad?.lastPolicyCheck?.draftOptions || attempt?.ad?.lastPolicyCheck?.submissionOptions || {};
    return {
      rubric: policyOptions.rubric || draftOptions.rubric || null,
      priceOption: this.effectivePriceOption(attempt?.ad, policyOptions.priceOption || draftOptions.priceOption),
      media: this.normalizeMediaOverrides(policyOptions.media || draftOptions.media),
    };
  }

  private withSubmissionOptions(policyResult: any, ad: any, priceOption?: string) {
    const draftOptions = ad?.lastPolicyCheck?.draftOptions || ad?.lastPolicyCheck?.submissionOptions || {};
    return {
      ...policyResult,
      submissionOptions: {
        rubric: draftOptions.rubric || null,
        priceOption: this.effectivePriceOption(ad, priceOption || draftOptions.priceOption),
        media: this.normalizeMediaOverrides(draftOptions.media),
      },
    };
  }

  private effectivePriceOption(ad: any, option?: string) {
    const numericPrice = Number(ad?.price || 0);
    if (Number.isFinite(numericPrice) && numericPrice > 0 && (!option || option === 'v_textu')) {
      return 'fixed_price';
    }
    return option || 'fixed_price';
  }

  private normalizeMediaOverrides(media?: any[]) {
    return (Array.isArray(media) ? media : [])
      .filter((item) => item && typeof item.url === 'string' && /^https?:\/\//i.test(item.url))
      .slice(0, 20)
      .map((item, index) => ({
        id: item.id || undefined,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || item.url,
        altText: item.altText || item.title || undefined,
        title: item.title || item.altText || undefined,
        position: Number.isFinite(Number(item.position)) ? Number(item.position) : index,
      }));
  }

  private async identityIdsForUser(userId: string): Promise<string[]> {
    const identities = await this.prisma.bazosIdentity.findMany({ where: { userId }, select: { id: true } });
    return identities.map((identity) => identity.id);
  }

  private assertChallengeState(challengeState?: string) {
    const allowed = Object.values(REVIEW_STATE).filter((state) => state !== REVIEW_STATE.CLEAR);
    if (!challengeState || !allowed.includes(challengeState as any)) {
      throw new BadRequestException(`Invalid challenge state: ${challengeState}`);
    }
    return challengeState;
  }
}

type PublishEvidenceDto = Pick<EnqueueBazosPublishDto, 'publicDuplicateCheck' | 'contentPolicy'>;
