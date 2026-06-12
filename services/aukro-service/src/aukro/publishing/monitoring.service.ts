import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService } from '@bazos/shared';

@Injectable()
export class BazosMonitoringService {
  private readonly logger: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('BazosMonitoringService');
  }

  async summary() {
    const [attemptsByStatus, identitiesByState, activeAds, blockedChallenges, staleSubmitting] = await Promise.all([
      this.prisma.bazosPublishAttempt.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.bazosIdentity.groupBy({
        by: ['status', 'sessionState', 'reviewState'],
        _count: { id: true },
      }),
      this.prisma.bazosAd.count({
        where: {
          isActive: true,
          publishStatus: { in: ['published', 'active'] },
        },
      }),
      this.prisma.bazosPublishAttempt.count({
        where: { status: 'challenge_required' },
      }),
      this.prisma.bazosPublishAttempt.count({
        where: {
          status: 'submitting',
          startedAt: { lt: new Date(Date.now() - 30 * 60 * 1000) },
        },
      }),
    ]);

    return {
      attemptsByStatus,
      identitiesByState,
      activeAds,
      blockedChallenges,
      staleSubmitting,
      generatedAt: new Date(),
    };
  }

  async blocked(limit = 50) {
    return this.prisma.bazosPublishAttempt.findMany({
      where: {
        status: { in: ['policy_blocked', 'challenge_required', 'failed'] },
      },
      include: {
        identity: true,
        ad: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  async reconcileIdentityCounts() {
    const identities = await this.prisma.bazosIdentity.findMany({ select: { id: true } });
    const results = [];

    for (const identity of identities) {
      const activeAdCount = await this.prisma.bazosAd.count({
        where: {
          identityId: identity.id,
          isActive: true,
          publishStatus: { in: ['published', 'active'] },
        },
      });
      const updated = await this.prisma.bazosIdentity.update({
        where: { id: identity.id },
        data: { activeAdCount },
      });
      results.push({ identityId: identity.id, activeAdCount: updated.activeAdCount });
    }

    this.logger.log(`Reconciled Bazos active ad counts for ${results.length} identities`);
    return { reconciled: results.length, identities: results };
  }

  async expireStaleSubmitting(maxAgeMinutes = 30) {
    const staleBefore = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    const stale = await this.prisma.bazosPublishAttempt.findMany({
      where: {
        status: 'submitting',
        startedAt: { lt: staleBefore },
      },
      include: { ad: true },
    });

    for (const attempt of stale) {
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

    return { expired: stale.length, maxAgeMinutes };
  }
}
