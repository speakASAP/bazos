import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService } from '@bazos/shared';
import { PublishingPolicyService } from './publishing-policy.service';

const TERMINAL_ATTEMPT_STATUSES = ['submitted', 'challenge_required', 'failed', 'policy_blocked'];

@Injectable()
export class PublisherQueueService {
  private readonly logger: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly publishingPolicyService: PublishingPolicyService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('PublisherQueueService');
  }

  async enqueueOffer(adId: string, userId: string, data: any = {}) {
    const decision = await this.publishingPolicyService.reserveOfferPublishSlot(adId, userId, data.identityId, data);

    if (!decision.allowed || !decision.identityId) {
      return { queued: false, decision };
    }

    const ad = await this.prisma.bazosAd.findUnique({ where: { id: adId } });
    if (!ad) {
      throw new Error(`Ad ${adId} not found`);
    }

    const attempt = await this.prisma.bazosPublishAttempt.create({
      data: {
        identityId: decision.identityId,
        adId,
        productId: ad.productId,
        status: 'queued',
        policyResult: decision as any,
        notBefore: decision.nextPublishNotBefore,
      },
    });

    return {
      queued: true,
      attempt,
      decision,
    };
  }

  async listQueue(userId: string, query: any = {}) {
    return this.prisma.bazosPublishAttempt.findMany({
      where: {
        status: query.status || undefined,
        identityId: query.identityId,
        adId: query.adId,
        identity: { userId },
      },
      include: {
        identity: true,
        ad: true,
      },
      orderBy: [
        { notBefore: 'asc' },
        { createdAt: 'asc' },
      ],
      take: Number(query.limit || 50),
    });
  }

  async nextDue(userId: string, limit = 5) {
    const now = new Date();
    const attempts = await this.prisma.bazosPublishAttempt.findMany({
      where: {
        status: 'queued',
        OR: [{ notBefore: null }, { notBefore: { lte: now } }],
        identity: {
          userId,
          status: 'verified',
          sessionState: 'active',
          reviewState: 'clear',
        },
      },
      include: {
        identity: true,
        ad: true,
      },
      orderBy: [
        { notBefore: 'asc' },
        { createdAt: 'asc' },
      ],
      take: limit,
    });

    return attempts.filter((attempt) => !!attempt.ad && attempt.ad.isActive);
  }

  async claimNext(userId: string, data: any = {}) {
    const due = await this.nextDue(userId, Number(data.limit || 1));
    const attempt = due[0];

    if (!attempt || !attempt.ad) {
      return { claimed: false, reason: 'no_due_attempts' };
    }

    const decision = await this.publishingPolicyService.evaluateOffer(attempt.ad.id, userId, attempt.identityId, data);
    if (!decision.allowed) {
      await this.prisma.bazosPublishAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'policy_blocked',
          policyResult: decision as any,
          completedAt: new Date(),
        },
      });
      await this.prisma.bazosAd.update({
        where: { id: attempt.ad.id },
        data: { publishStatus: 'blocked_policy', lastPolicyCheck: decision as any },
      });
      return { claimed: false, reason: 'policy_blocked', decision };
    }

    const updated = await this.prisma.bazosPublishAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'submitting',
        startedAt: new Date(),
        policyResult: decision as any,
      },
      include: {
        identity: true,
        ad: true,
      },
    });

    await this.prisma.bazosAd.update({
      where: { id: attempt.ad.id },
      data: { publishStatus: 'publishing', lastPolicyCheck: decision as any },
    });

    return {
      claimed: true,
      attempt: updated,
      submission: this.buildSubmissionPacket(updated),
    };
  }

  async recordResult(attemptId: string, userId: string, data: any = {}) {
    const existing = await this.prisma.bazosPublishAttempt.findFirst({
      where: { id: attemptId, identity: { userId } },
      include: { identity: true, ad: true },
    });
    if (!existing) {
      throw new Error(`Bazos publish attempt ${attemptId} not found`);
    }
    if (TERMINAL_ATTEMPT_STATUSES.includes(existing.status)) {
      throw new Error(`Publish attempt is already terminal: ${existing.status}`);
    }
    if (data.success && !data.bazosAdId) {
      throw new Error('bazosAdId is required for successful publish results');
    }

    const challengeType = data.challengeType || data.challengeState;
    const status = data.success ? 'submitted' : (challengeType ? 'challenge_required' : 'failed');
    const attempt = await this.prisma.bazosPublishAttempt.update({
      where: { id: attemptId },
      data: {
        status,
        challengeState: challengeType,
        completedAt: new Date(),
        error: data.error,
      },
      include: {
        identity: true,
        ad: true,
      },
    });

    if (attempt.ad) {
      await this.prisma.bazosAd.update({
        where: { id: attempt.ad.id },
        data: {
          bazosAdId: data.success ? data.bazosAdId : undefined,
          publishStatus: data.success ? 'published' : (challengeType ? 'blocked_challenge' : 'failed'),
          challengeState: challengeType || null,
          lastPublishedAt: data.success ? new Date() : undefined,
        },
      });
    }

    if (challengeType) {
      await this.prisma.bazosIdentity.update({
        where: { id: attempt.identityId },
        data: {
          sessionState: 'challenge',
          reviewState: challengeType,
        },
      });
    }

    if (data.success) {
      await this.prisma.bazosIdentity.update({
        where: { id: attempt.identityId },
        data: {
          activeAdCount: { increment: 1 },
        },
      });
    }

    if (data.success && attempt.ad?.category) {
      await this.prisma.bazosIdentityCategoryCadence.upsert({
        where: {
          identityId_bazosCategory: {
            identityId: attempt.identityId,
            bazosCategory: attempt.ad.category,
          },
        },
        update: { lastPublishedAt: new Date() },
        create: {
          identityId: attempt.identityId,
          bazosCategory: attempt.ad.category,
          lastPublishedAt: new Date(),
        },
      });
    }

    this.logger.log(`Recorded Bazos publish attempt ${attemptId} result`, { status });
    return attempt;
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
      prohibitedAutomation: ['captcha_bypass', 'sms_bypass', 'bank_check_bypass', 'device_fingerprint_spoofing', 'proxy_rotation'],
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
        category: ad.category,
        location: ad.location || identity.defaultLocation,
      },
    };
  }
}
