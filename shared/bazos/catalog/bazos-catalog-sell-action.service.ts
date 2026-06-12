import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { BazosAdService } from '../ad/bazos-ad.service';
import { BazosPublisherQueueService } from '../publisher/bazos-publisher-queue.service';
import {
  CatalogSellActionStatusQueryDto,
  ConfirmCatalogSellActionDto,
  PrepareCatalogSellActionDto,
} from './bazos-catalog-sell-action.dto';

const REUSABLE_DRAFT_STATUSES = ['draft', 'blocked_policy', 'failed', 'challenge'];
const HUMAN_ACTION_ATTEMPT_STATUSES = ['policy_blocked', 'challenge_required', 'failed'];

@Injectable()
export class BazosCatalogSellActionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly ads: BazosAdService,
    private readonly queue: BazosPublisherQueueService,
  ) {}

  async prepare(userId: string, productId: string, dto: PrepareCatalogSellActionDto) {
    const identity = await this.findIdentityForUser(dto.identityId, userId);
    const categoryMapping = await this.findCategoryMapping(dto.category);
    const draft = await this.findOrCreateDraft(userId, productId, dto);
    const policyStatus = await this.ads.evaluatePublishPolicy(draft.id, userId);

    this.logger.log('Catalog Bazos sell action prepared', {
      productId,
      adId: draft.id,
      identityId: identity.id,
      allowed: policyStatus.allowed,
    });

    return this.buildActionResponse({
      productId,
      draft,
      identity,
      categoryMapping,
      policyStatus,
      queueResult: null,
    });
  }

  async confirm(userId: string, productId: string, dto: ConfirmCatalogSellActionDto) {
    if (dto.confirmed !== true) {
      throw new BadRequestException('Explicit user confirmation is required before queueing Bazos publish');
    }

    const draft = await this.findDraftForProduct(dto.adId, productId, userId);
    const identity = draft.identity;
    const categoryMapping = await this.findCategoryMapping(draft.category);
    const queueResult = await this.queue.enqueueDraft(draft.id, userId, dto);
    const refreshedDraft = await this.findDraftForProduct(draft.id, productId, userId);

    this.logger.log('Catalog Bazos sell action confirmation handled by guarded queue', {
      productId,
      adId: draft.id,
      identityId: draft.identityId,
      queued: queueResult.queued,
    });

    return this.buildActionResponse({
      productId,
      draft: refreshedDraft,
      identity,
      categoryMapping,
      policyStatus: queueResult.decision || queueResult.attempt?.policyResult || null,
      queueResult,
    });
  }

  async status(userId: string, productId: string, query: CatalogSellActionStatusQueryDto = {}) {
    const draft = await this.findLatestDraftForStatus(userId, productId, query);
    const latestAttempt = await this.prisma.bazosPublishAttempt.findFirst({
      where: { adId: draft.id },
      orderBy: { createdAt: 'desc' },
    });
    const categoryMapping = await this.findCategoryMapping(draft.category);

    return {
      action: 'sell_on_bazos',
      productId,
      draft: this.describeDraft(draft),
      identity: this.describeIdentity(draft.identity),
      categoryMapping: this.describeCategoryMapping(draft.category, categoryMapping),
      latestAttempt: latestAttempt ? this.describeAttempt(latestAttempt) : null,
      requiresConfirmation: draft.publishStatus === 'draft',
      requiresHumanAction: this.requiresHumanAction(draft, latestAttempt),
    };
  }

  private async findOrCreateDraft(userId: string, productId: string, dto: PrepareCatalogSellActionDto) {
    const existing = await this.prisma.bazosAd.findFirst({
      where: {
        productId,
        identityId: dto.identityId,
        isActive: true,
        publishStatus: { in: REUSABLE_DRAFT_STATUSES },
      },
      include: { identity: true },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return existing;

    return this.ads.createDraftFromCatalog(userId, {
      identityId: dto.identityId,
      productId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      category: dto.category,
      location: dto.location,
      stockQuantity: dto.stockQuantity ?? 0,
    });
  }

  private async findDraftForProduct(adId: string, productId: string, userId: string) {
    const draft = await this.prisma.bazosAd.findFirst({
      where: { id: adId, productId, identity: { userId } },
      include: { identity: true },
    });
    if (!draft) throw new NotFoundException('Catalog Bazos draft not found for this product');
    return draft;
  }

  private async findLatestDraftForStatus(userId: string, productId: string, query: CatalogSellActionStatusQueryDto) {
    if (!query.adId && !query.identityId) {
      throw new BadRequestException('Either adId or identityId is required for sell action status polling');
    }

    const draft = await this.prisma.bazosAd.findFirst({
      where: {
        productId,
        ...(query.adId ? { id: query.adId } : {}),
        ...(query.identityId ? { identityId: query.identityId } : {}),
        identity: { userId },
      },
      include: { identity: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!draft) throw new NotFoundException('Catalog Bazos draft not found for this product');
    return draft;
  }

  private async findIdentityForUser(identityId: string, userId: string) {
    const identity = await this.prisma.bazosIdentity.findFirst({ where: { id: identityId, userId } });
    if (!identity) throw new NotFoundException('Bazos identity not found for this user');
    return identity;
  }

  private async findCategoryMapping(bazosCategory: string | null | undefined) {
    if (!bazosCategory) return null;
    return this.prisma.bazosCategory.findFirst({ where: { bazosCategory, isActive: true } });
  }

  private buildActionResponse(input: {
    productId: string;
    draft: any;
    identity: any;
    categoryMapping: any;
    policyStatus: any;
    queueResult: any;
  }) {
    return {
      action: 'sell_on_bazos',
      productId: input.productId,
      draft: this.describeDraft(input.draft),
      identity: this.describeIdentity(input.identity),
      categoryMapping: this.describeCategoryMapping(input.draft.category, input.categoryMapping),
      policyStatus: input.policyStatus,
      requiresConfirmation: !input.queueResult,
      canQueueAfterConfirmation: Boolean(input.policyStatus?.allowed),
      queue: input.queueResult,
      requiresHumanAction: this.requiresHumanAction(input.draft, input.queueResult?.attempt),
      nextAction: this.nextAction(input.policyStatus, input.queueResult),
    };
  }

  private describeDraft(draft: any) {
    return {
      id: draft.id,
      productId: draft.productId,
      identityId: draft.identityId,
      title: draft.title,
      price: draft.price,
      category: draft.category,
      location: draft.location,
      publishStatus: draft.publishStatus,
      challengeState: draft.challengeState,
      bazosAdId: draft.bazosAdId,
      lastPolicyCheck: draft.lastPolicyCheck,
    };
  }

  private describeIdentity(identity: any) {
    return {
      id: identity.id,
      displayName: identity.displayName,
      contactName: identity.contactName,
      defaultZip: identity.defaultZip,
      defaultLocation: identity.defaultLocation,
      status: identity.status,
      reviewState: identity.reviewState,
      sessionState: identity.sessionState,
      activeAdCount: identity.activeAdCount,
      verificationExpiresAt: identity.verificationExpiresAt,
      nextPublishNotBefore: identity.nextPublishNotBefore,
    };
  }

  private describeCategoryMapping(bazosCategory: string | null | undefined, mapping: any) {
    return {
      bazosCategory: bazosCategory || null,
      mapped: Boolean(mapping),
      catalogCategoryId: mapping?.catalogCategoryId || null,
    };
  }

  private describeAttempt(attempt: any) {
    return {
      id: attempt.id,
      status: attempt.status,
      policyResult: attempt.policyResult,
      challengeState: attempt.challengeState,
      notBefore: attempt.notBefore,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      error: attempt.error,
    };
  }

  private requiresHumanAction(draft: any, attempt: any) {
    const challengeState = draft.challengeState || attempt?.challengeState || null;
    const policyFailures = attempt?.policyResult?.failures || draft.lastPolicyCheck?.failures || [];
    const attemptStatus = attempt?.status || null;
    const requiresAction = Boolean(
      challengeState ||
        draft.publishStatus === 'challenge' ||
        draft.publishStatus === 'blocked_policy' ||
        HUMAN_ACTION_ATTEMPT_STATUSES.includes(attemptStatus),
    );

    return {
      required: requiresAction,
      reason: challengeState || attemptStatus || (policyFailures[0] ? policyFailures[0].gate : null),
      policyFailures,
      error: attempt?.error || null,
    };
  }

  private nextAction(policyStatus: any, queueResult: any) {
    if (queueResult?.queued) return 'poll_publish_status';
    if (queueResult && !queueResult.queued) return 'resolve_policy_failures';
    if (policyStatus?.allowed) return 'confirm_publish';
    return 'resolve_policy_failures';
  }
}
