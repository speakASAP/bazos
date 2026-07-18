import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService } from '@bazos/shared';

type PolicyReason = {
  code: string;
  message: string;
  retryAt?: Date;
};

type PolicyDecision = {
  allowed: boolean;
  reasons: PolicyReason[];
  identityId?: string;
  adId?: string;
  earliestRetryAt?: Date;
  nextPublishDelaySeconds?: number;
  nextPublishNotBefore?: Date;
  limits: {
    activeAdsPerIdentity: number;
    minimumPublishDelaySeconds: number;
    maximumPublishDelaySeconds: number;
    sameCategoryCooldownHours: number;
  };
};

const ACTIVE_AD_LIMIT = 50;
const MIN_PUBLISH_DELAY_SECONDS = 60;
const MAX_PUBLISH_DELAY_SECONDS = 180;
const SAME_CATEGORY_COOLDOWN_HOURS = 24;

@Injectable()
export class PublishingPolicyService {
  private readonly logger: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('PublishingPolicyService');
  }

  async evaluateOffer(adId: string, requestedIdentityId?: string): Promise<PolicyDecision> {
    const ad = await this.prisma.bazosAd.findUnique({
      where: { id: adId },
      include: { identity: true },
    });

    if (!ad) {
      throw new Error(`Ad ${adId} not found`);
    }

    const identity = await this.resolveIdentity(ad.accountId, ad.identityId, requestedIdentityId);
    const now = new Date();
    const reasons: PolicyReason[] = [];

    if (!identity) {
      reasons.push({
        code: 'identity_required',
        message: 'A verified Bazos identity with a phone number is required before publishing.',
      });
    } else {
      if (identity.status !== 'verified') {
        reasons.push({
          code: 'identity_not_verified',
          message: 'The phone number must be verified through the normal Bazos flow before publishing.',
        });
      }

      if (identity.reviewState !== 'clear') {
        reasons.push({
          code: 'identity_under_review',
          message: 'Publishing is paused while the identity is flagged, banned, limited, or awaiting manual review.',
        });
      }

      if (identity.sessionState !== 'ready') {
        reasons.push({
          code: 'session_not_ready',
          message: 'A human-approved Bazos browser session is required; CAPTCHA, SMS, or bank checks must not be bypassed.',
        });
      }

      if (identity.verificationExpiresAt && identity.verificationExpiresAt <= now) {
        reasons.push({
          code: 'verification_expired',
          message: 'The identity verification has expired and must be refreshed manually.',
        });
      }

      if (identity.activeAdCount >= ACTIVE_AD_LIMIT) {
        reasons.push({
          code: 'active_ad_limit',
          message: `The identity already has ${identity.activeAdCount} active ads; limit is ${ACTIVE_AD_LIMIT}.`,
        });
      }

      if (identity.nextPublishNotBefore && identity.nextPublishNotBefore > now) {
        reasons.push({
          code: 'publish_delay',
          message: 'The identity is inside the randomized minimum delay window between posts.',
          retryAt: identity.nextPublishNotBefore,
        });
      }

      if (ad.category) {
        const cadence = await this.prisma.bazosIdentityCategoryCadence.findUnique({
          where: {
            identityId_bazosCategory: {
              identityId: identity.id,
              bazosCategory: ad.category,
            },
          },
        });
        const retryAt = cadence
          ? new Date(cadence.lastPublishedAt.getTime() + SAME_CATEGORY_COOLDOWN_HOURS * 60 * 60 * 1000)
          : undefined;

        if (retryAt && retryAt > now) {
          reasons.push({
            code: 'category_cadence',
            message: `The same identity cannot publish into category ${ad.category} until the category cooldown expires.`,
            retryAt,
          });
        }
      }
    }

    if (!ad.isActive || ad.stockQuantity <= 0) {
      reasons.push({
        code: 'not_sellable',
        message: 'Only active offers with available stock can be published.',
      });
    }

    if (ad.bazosAdId || ['published', 'active', 'publishing'].includes(ad.publishStatus)) {
      reasons.push({
        code: 'already_published',
        message: 'The offer already has a Bazos publication or is currently publishing.',
      });
    }

    if (!ad.title || ad.title.trim().length < 5) {
      reasons.push({
        code: 'title_invalid',
        message: 'The offer title is too short for a compliant Bazos advertisement.',
      });
    }

    if (!ad.description || ad.description.trim().length < 20) {
      reasons.push({
        code: 'description_invalid',
        message: 'The offer description must be complete enough for a real buyer.',
      });
    }

    const retryDates = reasons.map((reason) => reason.retryAt).filter(Boolean) as Date[];
    const earliestRetryAt = retryDates.length
      ? new Date(Math.max(...retryDates.map((date) => date.getTime())))
      : undefined;
    const nextPublishDelaySeconds = this.randomPublishDelaySeconds();
    const nextPublishNotBefore = new Date(now.getTime() + nextPublishDelaySeconds * 1000);
    const decision: PolicyDecision = {
      allowed: reasons.length === 0,
      reasons,
      identityId: identity?.id,
      adId,
      earliestRetryAt,
      nextPublishDelaySeconds,
      nextPublishNotBefore,
      limits: this.limits(),
    };

    await this.prisma.bazosAd.update({
      where: { id: adId },
      data: { lastPolicyCheck: decision as any },
    });

    if (identity) {
      await this.prisma.bazosPublishAttempt.create({
        data: {
          identityId: identity.id,
          adId,
          productId: ad.productId,
          status: decision.allowed ? 'policy_passed' : 'policy_blocked',
          policyResult: decision as any,
          notBefore: decision.allowed ? nextPublishNotBefore : earliestRetryAt,
        },
      });
    }

    return decision;
  }

  async reserveOfferPublishSlot(adId: string, requestedIdentityId?: string) {
    const decision = await this.evaluateOffer(adId, requestedIdentityId);

    if (!decision.allowed || !decision.identityId) {
      return decision;
    }

    await this.prisma.bazosIdentity.update({
      where: { id: decision.identityId },
      data: {
        nextPublishNotBefore: decision.nextPublishNotBefore,
        lastPublishAttemptAt: new Date(),
      },
    });

    await this.prisma.bazosAd.update({
      where: { id: adId },
      data: {
        identityId: decision.identityId,
        publishStatus: 'queued',
      },
    });

    this.logger.log(`Reserved Bazos publish slot for ad ${adId}`, {
      identityId: decision.identityId,
      nextPublishNotBefore: decision.nextPublishNotBefore,
    });

    return decision;
  }

  limits() {
    return {
      activeAdsPerIdentity: ACTIVE_AD_LIMIT,
      minimumPublishDelaySeconds: MIN_PUBLISH_DELAY_SECONDS,
      maximumPublishDelaySeconds: MAX_PUBLISH_DELAY_SECONDS,
      sameCategoryCooldownHours: SAME_CATEGORY_COOLDOWN_HOURS,
    };
  }

  private async resolveIdentity(accountId: string, adIdentityId?: string | null, requestedIdentityId?: string) {
    if (requestedIdentityId || adIdentityId) {
      return this.prisma.bazosIdentity.findUnique({
        where: { id: requestedIdentityId || adIdentityId || '' },
      });
    }

    return this.prisma.bazosIdentity.findFirst({
      where: {
        accountId,
        status: 'verified',
        reviewState: 'clear',
      },
      orderBy: [
        { nextPublishNotBefore: 'asc' },
        { updatedAt: 'asc' },
      ],
    });
  }

  private randomPublishDelaySeconds() {
    const span = MAX_PUBLISH_DELAY_SECONDS - MIN_PUBLISH_DELAY_SECONDS + 1;
    return MIN_PUBLISH_DELAY_SECONDS + Math.floor(Math.random() * span);
  }
}
