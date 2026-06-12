import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { REVIEW_STATE, SESSION_STATE } from '../identity/bazos-identity.types';
import {
  ExpireStaleBazosSubmissionsDto,
  ListBazosBlockedAttemptsDto,
  ReconcileBazosIdentityCountsDto,
} from './bazos-monitoring.dto';

const BLOCKED_ATTEMPT_STATUSES = ['policy_blocked', 'challenge_required', 'failed'];
const ACTIVE_AD_STATUSES = ['published', 'active'];
const DEFAULT_STALE_MINUTES = 30;

@Injectable()
export class BazosMonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async summary(userId: string) {
    const identityIds = await this.identityIdsForUser(userId);
    const staleBefore = new Date(Date.now() - DEFAULT_STALE_MINUTES * 60_000);
    const [attempts, identities, activeAds, staleSubmitting, recentBlocked] = await Promise.all([
      this.prisma.bazosPublishAttempt.groupBy({
        by: ['status'],
        where: { identityId: { in: identityIds } },
        _count: { status: true },
      }),
      this.prisma.bazosIdentity.findMany({
        where: { id: { in: identityIds } },
        select: { id: true, status: true, sessionState: true, reviewState: true, activeAdCount: true },
      }),
      this.prisma.bazosAd.count({
        where: { identityId: { in: identityIds }, isActive: true, publishStatus: { in: ACTIVE_AD_STATUSES } },
      }),
      this.prisma.bazosPublishAttempt.count({
        where: { identityId: { in: identityIds }, status: 'submitting', startedAt: { lt: staleBefore } },
      }),
      this.prisma.bazosPublishAttempt.findMany({
        where: { identityId: { in: identityIds }, status: { in: BLOCKED_ATTEMPT_STATUSES } },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      }),
    ]);

    const metrics = [
      ...attempts.map((row) => this.metric('bazos_publish_attempts_total', row._count.status, { status: row.status })),
      ...this.countPolicyFailures(recentBlocked).map(([gate, value]) =>
        this.metric('bazos_policy_gate_failures_total', value, { gate }),
      ),
      ...this.countChallengeStates(recentBlocked).map(([state, value]) =>
        this.metric('bazos_challenge_states_total', value, { state }),
      ),
      this.metric('bazos_identities_needing_review', identities.filter((identity) => this.identityNeedsReview(identity)).length),
      this.metric('bazos_active_ads_tracked', activeAds),
      this.metric('bazos_stale_submitting_attempts', staleSubmitting),
    ];

    this.logger.log('Bazos monitoring summary generated', {
      userId,
      identityCount: identityIds.length,
      metricCount: metrics.length,
      staleSubmitting,
    });

    return {
      generatedAt: new Date(),
      metrics,
      attemptsByStatus: attempts.map((row) => ({ status: row.status, count: row._count.status })),
      identitiesNeedingReview: identities.filter((identity) => this.identityNeedsReview(identity)).length,
      activeAdsTracked: activeAds,
      staleSubmitting,
    };
  }

  async blockedAttempts(userId: string, query: ListBazosBlockedAttemptsDto = {}) {
    const identityIds = await this.identityIdsForUser(userId);
    const attempts = await this.prisma.bazosPublishAttempt.findMany({
      where: { identityId: { in: identityIds }, status: { in: BLOCKED_ATTEMPT_STATUSES } },
      include: { identity: true, ad: true },
      orderBy: { updatedAt: 'desc' },
      take: Number(query.limit || 50),
    });

    return {
      generatedAt: new Date(),
      count: attempts.length,
      attempts: attempts.map((attempt) => this.describeAttempt(attempt)),
    };
  }

  async reviewIdentities(userId: string) {
    const identities = await this.prisma.bazosIdentity.findMany({
      where: {
        userId,
        OR: [
          { reviewState: { not: REVIEW_STATE.CLEAR } },
          { sessionState: { in: [SESSION_STATE.EXPIRED, SESSION_STATE.CHALLENGE] } },
          { status: { in: ['suspended', 'banned'] } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      generatedAt: new Date(),
      count: identities.length,
      identities: identities.map((identity) => this.describeIdentity(identity)),
    };
  }

  async reconcileIdentityCounts(userId: string, dto: ReconcileBazosIdentityCountsDto = {}) {
    const identities = await this.prisma.bazosIdentity.findMany({
      where: { userId, ...(dto.identityId ? { id: dto.identityId } : {}) },
      select: { id: true, activeAdCount: true },
    });
    if (dto.identityId && identities.length === 0) {
      throw new NotFoundException('Bazos identity not found for this user');
    }

    const results = [];
    for (const identity of identities) {
      const trackedActiveAdCount = await this.prisma.bazosAd.count({
        where: { identityId: identity.id, isActive: true, publishStatus: { in: ACTIVE_AD_STATUSES } },
      });
      if (identity.activeAdCount !== trackedActiveAdCount) {
        await this.prisma.bazosIdentity.update({
          where: { id: identity.id },
          data: { activeAdCount: trackedActiveAdCount },
        });
      }
      results.push({
        identityId: identity.id,
        previousActiveAdCount: identity.activeAdCount,
        reconciledActiveAdCount: trackedActiveAdCount,
        changed: identity.activeAdCount !== trackedActiveAdCount,
      });
    }

    this.logger.log('Bazos active ad counts reconciled', {
      userId,
      reconciled: results.length,
      changed: results.filter((result) => result.changed).length,
    });

    return {
      metric: this.metric('bazos_reconciled_identity_counts_total', results.length),
      reconciled: results.length,
      identities: results,
    };
  }

  async expireStaleSubmissions(userId: string, dto: ExpireStaleBazosSubmissionsDto = {}) {
    const identityIds = await this.identityIdsForUser(userId);
    const maxAgeMinutes = Number(dto.maxAgeMinutes || DEFAULT_STALE_MINUTES);
    const staleBefore = new Date(Date.now() - maxAgeMinutes * 60_000);
    const staleAttempts = await this.prisma.bazosPublishAttempt.findMany({
      where: { identityId: { in: identityIds }, status: 'submitting', startedAt: { lt: staleBefore } },
      include: { ad: true },
    });

    for (const attempt of staleAttempts) {
      await this.prisma.bazosPublishAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: `Submission stale for more than ${maxAgeMinutes} minutes`,
        },
      });
      if (attempt.ad) {
        await this.prisma.bazosAd.update({
          where: { id: attempt.ad.id },
          data: { publishStatus: 'failed' },
        });
      }
    }

    this.logger.warn('Bazos stale submitting attempts expired', {
      userId,
      expired: staleAttempts.length,
      maxAgeMinutes,
    });

    return {
      metric: this.metric('bazos_expired_stale_submissions_total', staleAttempts.length),
      expired: staleAttempts.length,
      maxAgeMinutes,
      attempts: staleAttempts.map((attempt) => ({ id: attempt.id, adId: attempt.adId, identityId: attempt.identityId })),
    };
  }

  private async identityIdsForUser(userId: string) {
    const identities = await this.prisma.bazosIdentity.findMany({ where: { userId }, select: { id: true } });
    return identities.map((identity) => identity.id);
  }

  private describeAttempt(attempt: any) {
    return {
      id: attempt.id,
      status: attempt.status,
      identityId: attempt.identityId,
      adId: attempt.adId,
      productId: attempt.productId,
      challengeState: attempt.challengeState,
      policyFailures: attempt.policyResult?.failures || [],
      notBefore: attempt.notBefore,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      error: attempt.error,
      identity: attempt.identity ? this.describeIdentity(attempt.identity) : null,
      ad: attempt.ad ? this.describeAd(attempt.ad) : null,
    };
  }

  private describeIdentity(identity: any) {
    return {
      id: identity.id,
      displayName: identity.displayName,
      status: identity.status,
      sessionState: identity.sessionState,
      reviewState: identity.reviewState,
      activeAdCount: identity.activeAdCount,
      verificationExpiresAt: identity.verificationExpiresAt,
      nextPublishNotBefore: identity.nextPublishNotBefore,
    };
  }

  private describeAd(ad: any) {
    return {
      id: ad.id,
      productId: ad.productId,
      title: ad.title,
      category: ad.category,
      publishStatus: ad.publishStatus,
      challengeState: ad.challengeState,
      bazosAdId: ad.bazosAdId,
      isActive: ad.isActive,
    };
  }

  private identityNeedsReview(identity: any) {
    return (
      identity.reviewState !== REVIEW_STATE.CLEAR ||
      [SESSION_STATE.EXPIRED, SESSION_STATE.CHALLENGE].includes(identity.sessionState) ||
      ['suspended', 'banned'].includes(identity.status)
    );
  }

  private countPolicyFailures(attempts: any[]) {
    const counts = new Map<string, number>();
    for (const attempt of attempts) {
      for (const failure of attempt.policyResult?.failures || []) {
        counts.set(failure.gate, (counts.get(failure.gate) || 0) + 1);
      }
    }
    return Array.from(counts.entries());
  }

  private countChallengeStates(attempts: any[]) {
    const counts = new Map<string, number>();
    for (const attempt of attempts) {
      if (attempt.challengeState) counts.set(attempt.challengeState, (counts.get(attempt.challengeState) || 0) + 1);
    }
    return Array.from(counts.entries());
  }

  private metric(name: string, value: number, labels: Record<string, string> = {}) {
    return { name, value, labels };
  }
}
