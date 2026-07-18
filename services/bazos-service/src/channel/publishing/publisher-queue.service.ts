import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService } from '@bazos/shared';
import { PublishingPolicyService } from './publishing-policy.service';

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

  async enqueueOffer(adId: string, data: any = {}) {
    const decision = await this.publishingPolicyService.reserveOfferPublishSlot(adId, data.identityId);

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

  async listQueue(query: any = {}) {
    return this.prisma.bazosPublishAttempt.findMany({
      where: {
        status: query.status || undefined,
        identityId: query.identityId,
        adId: query.adId,
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

  async nextDue(limit = 5) {
    const now = new Date();
    const attempts = await this.prisma.bazosPublishAttempt.findMany({
      where: {
        status: 'queued',
        OR: [{ notBefore: null }, { notBefore: { lte: now } }],
        identity: {
          status: 'verified',
          sessionState: 'ready',
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

  async claimNext(data: any = {}) {
    const due = await this.nextDue(Number(data.limit || 1));
    const attempt = due[0];

    if (!attempt || !attempt.ad) {
      return { claimed: false, reason: 'no_due_attempts' };
    }

    const updated = await this.prisma.bazosPublishAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'submitting',
        startedAt: new Date(),
      },
      include: {
        identity: true,
        ad: true,
      },
    });

    await this.prisma.bazosAd.update({
      where: { id: attempt.ad.id },
      data: { publishStatus: 'publishing' },
    });

    return {
      claimed: true,
      attempt: updated,
      submission: this.buildSubmissionPacket(updated),
    };
  }

  async recordResult(attemptId: string, data: any = {}) {
    const status = data.success ? 'submitted' : (data.challengeType ? 'challenge_required' : 'failed');
    const attempt = await this.prisma.bazosPublishAttempt.update({
      where: { id: attemptId },
      data: {
        status,
        challengeState: data.challengeType,
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
          bazosAdId: data.bazosAdId,
          publishStatus: data.success ? 'published' : (data.challengeType ? 'blocked_challenge' : 'failed'),
          lastPublishedAt: data.success ? new Date() : undefined,
        },
      });
    }

    if (data.challengeType) {
      await this.prisma.bazosIdentity.update({
        where: { id: attempt.identityId },
        data: {
          sessionState: 'challenge_required',
          reviewState: data.challengeType === 'manual_review' ? 'review_required' : 'clear',
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
      prohibitedAutomation: ['captcha_bypass', 'sms_bypass', 'bank_check_bypass', 'device_fingerprint_spoofing'],
      identity: {
        id: identity.id,
        phoneNumber: identity.phoneNumber,
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
