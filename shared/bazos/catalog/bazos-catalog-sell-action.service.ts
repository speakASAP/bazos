import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { BazosAdService } from '../ad/bazos-ad.service';
import { BazosPublisherQueueService } from '../publisher/bazos-publisher-queue.service';
import { WarehouseClientService } from '../../clients/warehouse-client.service';
import { POLICY_GATE } from '../policy/publish-policy.types';
import {
  CatalogSellActionStatusQueryDto,
  ConfirmCatalogSellActionDto,
  PrepareCatalogSellActionDto,
} from './bazos-catalog-sell-action.dto';

const REUSABLE_DRAFT_STATUSES = ['draft', 'blocked_policy', 'failed', 'challenge'];
const HUMAN_ACTION_ATTEMPT_STATUSES = ['policy_blocked', 'challenge_required', 'failed'];
const ACTIVE_PUBLISHED_STATUSES = ['published', 'publishing', 'queued'];
const MANUAL_CONFIRMATION_GATES = new Set<string>([
  POLICY_GATE.PUBLIC_DUPLICATE_CHECK_MISSING,
  POLICY_GATE.CONTENT_POLICY_NOT_VALIDATED,
]);

@Injectable()
export class BazosCatalogSellActionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly ads: BazosAdService,
    private readonly queue: BazosPublisherQueueService,
    private readonly warehouseClient: WarehouseClientService,
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
    if (!draft) {
      return this.emptyStatusResponse(productId);
    }

    const latestAttempt = await this.prisma.bazosPublishAttempt.findFirst({
      where: { adId: draft.id },
      orderBy: { createdAt: 'desc' },
    });
    const categoryMapping = await this.findCategoryMapping(draft.category);

    const listingUrl = this.buildBazosListingUrl(draft.bazosAdId);
    const publishedOnBazos = Boolean(draft.isActive && draft.bazosAdId && draft.publishStatus === 'published');

    return {
      action: 'sell_on_bazos',
      productId,
      draft: this.describeDraft(draft),
      identity: this.describeIdentity(draft.identity),
      categoryMapping: this.describeCategoryMapping(draft.category, categoryMapping),
      latestAttempt: latestAttempt ? this.describeAttempt(latestAttempt) : null,
      publishedOnBazos,
      listingUrl,
      requiresConfirmation: draft.publishStatus === 'draft',
      requiresHumanAction: this.requiresHumanAction(draft, latestAttempt),
    };
  }

  private async findOrCreateDraft(userId: string, productId: string, dto: PrepareCatalogSellActionDto) {
    const media = this.mediaFromDto(dto);
    const stock = await this.resolveWarehouseStock(productId, dto.stockQuantity);
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
    if (existing) {
      return this.prisma.bazosAd.update({
        where: { id: existing.id },
        data: {
          title: dto.title,
          description: dto.description || null,
          price: dto.price,
          category: dto.category,
          location: dto.location || null,
          stockQuantity: stock.quantity,
          publishStatus: 'draft',
          challengeState: null,
          bazosAdId: null,
          lastPolicyCheck: this.buildDraftOptions(dto.rubric, dto.priceOption, media, stock) as any,
        },
        include: { identity: true },
      });
    }

    return this.ads.createDraftFromCatalog(userId, {
      identityId: dto.identityId,
      productId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      rubric: dto.rubric,
      priceOption: dto.priceOption,
      category: dto.category,
      location: dto.location,
      stockQuantity: stock.quantity,
      media,
    });
  }

  private async resolveWarehouseStock(productId: string, requestedQuantity?: number) {
    const totalAvailable = this.normalizeQuantity(await this.warehouseClient.getTotalAvailable(productId));
    const requested = requestedQuantity === undefined ? totalAvailable : this.normalizeQuantity(requestedQuantity);
    const quantity = Math.min(requested, totalAvailable);

    return {
      source: 'warehouse-microservice',
      totalAvailable,
      requestedQuantity: requestedQuantity === undefined ? null : requested,
      quantity,
      capped: quantity < requested,
    };
  }

  private normalizeQuantity(value: unknown) {
    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity <= 0) return 0;
    return Math.floor(quantity);
  }

  private mediaFromDto(dto: PrepareCatalogSellActionDto) {
    if (Array.isArray(dto.media) && dto.media.length) return dto.media;
    return (Array.isArray(dto.mediaUrls) ? dto.mediaUrls : []).map((url, index) => ({
      id: url,
      url,
      thumbnailUrl: url,
      position: index,
    }));
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
    return this.prisma.bazosAd.findFirst({
      where: {
        productId,
        isActive: true,
        ...(query.adId ? { id: query.adId } : {}),
        ...(query.identityId ? { identityId: query.identityId } : {}),
        identity: { userId },
      },
      include: { identity: true },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  private emptyStatusResponse(productId: string) {
    return {
      action: 'sell_on_bazos',
      productId,
      draft: null,
      identity: null,
      categoryMapping: null,
      latestAttempt: null,
      publishedOnBazos: false,
      listingUrl: null,
      requiresConfirmation: false,
      requiresHumanAction: {
        required: false,
        reason: null,
        policyFailures: [],
        error: null,
      },
      nextAction: 'create_bazos_draft',
    };
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
      canQueueAfterConfirmation: this.canQueueAfterConfirmation(input.policyStatus),
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
      description: draft.description,
      price: draft.price,
      rubric: this.draftOptions(draft).rubric,
      priceOption: this.draftOptions(draft).priceOption,
      media: this.draftOptions(draft).media,
      category: draft.category,
      location: draft.location,
      stockQuantity: draft.stockQuantity,
      publishStatus: draft.publishStatus,
      challengeState: draft.challengeState,
      bazosAdId: draft.bazosAdId,
      isActive: draft.isActive,
      publishedOnBazos: Boolean(draft.isActive && draft.bazosAdId && draft.publishStatus === 'published'),
      activeOnBazos: Boolean(draft.isActive && ACTIVE_PUBLISHED_STATUSES.includes(draft.publishStatus)),
      listingUrl: this.buildBazosListingUrl(draft.bazosAdId),
      lastPolicyCheck: draft.lastPolicyCheck,
    };
  }


  private buildDraftOptions(rubric?: string, priceOption?: string, media?: any[], warehouseStock?: any) {
    return {
      draftOptions: {
        rubric: rubric || null,
        priceOption: priceOption || 'fixed_price',
        media: this.normalizeMediaOverrides(media),
        ...(warehouseStock ? { warehouseStock } : {}),
      },
    };
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

  private canQueueAfterConfirmation(policyStatus: any) {
    if (policyStatus?.allowed) return true;
    const failures = Array.isArray(policyStatus?.failures) ? policyStatus.failures : [];
    if (!failures.length) return false;
    return failures.every((failure) => MANUAL_CONFIRMATION_GATES.has(String(failure?.gate || '')));
  }

  private draftOptions(draft: any) {
    const options = draft?.lastPolicyCheck?.draftOptions || draft?.lastPolicyCheck?.submissionOptions || {};
    return {
      rubric: options.rubric || null,
      priceOption: options.priceOption || 'fixed_price',
      media: this.normalizeMediaOverrides(options.media),
    };
  }

  private buildBazosListingUrl(bazosAdId: string | null | undefined) {
    const value = String(bazosAdId || '').trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    const baseUrl = (process.env.BAZOS_PUBLIC_AD_BASE_URL || 'https://www.bazos.cz/inzerat').replace(/\/$/, '');
    return `${baseUrl}/${encodeURIComponent(value)}/`;
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
