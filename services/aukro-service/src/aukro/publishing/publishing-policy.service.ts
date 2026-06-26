import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService } from '@bazos/shared';

type PolicyReason = {
  code: string;
  message: string;
  retryAt?: Date;
};

type EvidenceSource = 'manual_review' | 'trusted_backend';

type PublishEvidence = {
  publicDuplicateCheck?: {
    checkedAt?: string | Date;
    source?: EvidenceSource;
    likelyDuplicate?: boolean;
    reason?: string;
  };
  contentPolicy?: {
    checkedAt?: string | Date;
    source?: EvidenceSource;
    passed?: boolean;
    reason?: string;
  };
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
const EVIDENCE_TTL_MS = 60 * 60 * 1000;

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

  async evaluateOffer(adId: string, userId: string, requestedIdentityId?: string, evidence: PublishEvidence = {}): Promise<PolicyDecision> {
    const ad = await this.prisma.bazosAd.findUnique({
      where: { id: adId },
      include: { identity: true },
    });

    if (!ad) {
      throw new Error(`Ad ${adId} not found`);
    }

    const identity = await this.resolveIdentity(ad.accountId, userId, ad.identityId, requestedIdentityId);
    const now = new Date();
    const reasons: PolicyReason[] = [];

    if (!identity) {
      reasons.push({
        code: 'identity_required',
        message: 'A verified Bazos identity owned by the current user is required before publishing.',
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

      if (identity.sessionState !== 'active') {
        reasons.push({
          code: 'session_not_active',
          message: 'A human-approved active Bazos browser session is required; CAPTCHA, SMS, or bank checks must not be bypassed.',
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

      if (ad.productId) {
        const duplicate = await this.prisma.bazosAd.findFirst({
          where: {
            identityId: identity.id,
            productId: ad.productId,
            isActive: true,
            id: { not: ad.id },
          },
        });
        if (duplicate) {
          reasons.push({
            code: 'local_duplicate',
            message: 'An active local Bazos ad already exists for this product and identity.',
          });
        }
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

    if (!ad.category) {
      reasons.push({
        code: 'category_required',
        message: 'A mapped Bazos category is required before publishing.',
      });
    } else {
      const categoryMapping = await this.prisma.bazosCategory.findFirst({
        where: { bazosCategory: ad.category, isActive: true },
      });
      if (!categoryMapping) {
        reasons.push({
          code: 'category_missing_or_blocked',
          message: `Bazos category ${ad.category} has no active mapping; human review is required.`,
        });
      }
    }

    this.validatePublicDuplicateEvidence(evidence.publicDuplicateCheck, now, reasons);
    this.validateContentPolicyEvidence(evidence.contentPolicy, now, reasons);

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

  async reserveOfferPublishSlot(adId: string, userId: string, requestedIdentityId?: string, evidence: PublishEvidence = {}) {
    const decision = await this.evaluateOffer(adId, userId, requestedIdentityId, evidence);

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

  private async resolveIdentity(accountId: string, userId: string, adIdentityId?: string | null, requestedIdentityId?: string) {
    if (requestedIdentityId || adIdentityId) {
      return this.prisma.bazosIdentity.findFirst({
        where: { id: requestedIdentityId || adIdentityId || '', userId },
      });
    }

    return this.prisma.bazosIdentity.findFirst({
      where: {
        accountId,
        userId,
        status: 'verified',
        reviewState: 'clear',
      },
      orderBy: [
        { nextPublishNotBefore: 'asc' },
        { updatedAt: 'asc' },
      ],
    });
  }

  private validatePublicDuplicateEvidence(evidence: PublishEvidence['publicDuplicateCheck'], now: Date, reasons: PolicyReason[]) {
    if (!evidence || !this.isTrustedEvidence(evidence.source) || this.isEvidenceExpired(evidence.checkedAt, now)) {
      reasons.push({
        code: 'public_duplicate_evidence_required',
        message: 'Fresh public duplicate evidence from manual_review or trusted_backend is required before publishing.',
      });
      return;
    }
    if (evidence.likelyDuplicate) {
      reasons.push({
        code: 'public_duplicate',
        message: evidence.reason || 'Public duplicate evidence found a likely matching Bazos ad.',
      });
    }
  }

  private validateContentPolicyEvidence(evidence: PublishEvidence['contentPolicy'], now: Date, reasons: PolicyReason[]) {
    if (!evidence || !this.isTrustedEvidence(evidence.source) || this.isEvidenceExpired(evidence.checkedAt, now)) {
      reasons.push({
        code: 'content_policy_evidence_required',
        message: 'Fresh content policy evidence from manual_review or trusted_backend is required before publishing.',
      });
      return;
    }
    if (!evidence.passed) {
      reasons.push({
        code: 'content_policy_failed',
        message: evidence.reason || 'Content policy validation failed.',
      });
    }
  }

  private isEvidenceExpired(value: string | Date | undefined, now: Date): boolean {
    const time = value instanceof Date ? value.getTime() : new Date(value || '').getTime();
    return !Number.isFinite(time) || time > now.getTime() || now.getTime() - time > EVIDENCE_TTL_MS;
  }

  private isTrustedEvidence(source?: string): boolean {
    return source === 'manual_review' || source === 'trusted_backend';
  }

  private randomPublishDelaySeconds() {
    const span = MAX_PUBLISH_DELAY_SECONDS - MIN_PUBLISH_DELAY_SECONDS + 1;
    return MIN_PUBLISH_DELAY_SECONDS + Math.floor(Math.random() * span);
  }
}
