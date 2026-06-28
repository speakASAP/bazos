import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { PublishPolicyService } from '../policy/publish-policy.service';
import { CreateBazosAdDraftDto, CreateBazosAdDraftFromCatalogDto, UpdateBazosAdDraftDto } from './bazos-ad.dto';
import { REVIEW_STATE } from '../identity/bazos-identity.types';

@Injectable()
export class BazosAdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly policy: PublishPolicyService,
  ) {}

  /**
   * Create a local ad draft. No Bazos submission happens here.
   * The identityId must belong to an identity owned by the requesting user.
   */
  async createDraft(userId: string, dto: CreateBazosAdDraftDto) {
    const identity = await this.prisma.bazosIdentity.findFirst({
      where: { id: dto.identityId, userId },
    });
    if (!identity) {
      throw new NotFoundException('Bazos identity not found for this user');
    }
    if (!identity.accountId) {
      throw new BadRequestException('Identity must be linked to a Bazos account before creating ads');
    }

    const ad = await this.prisma.bazosAd.create({
      data: {
        accountId: identity.accountId,
        identityId: dto.identityId,
        productId: dto.productId || null,
        title: dto.title,
        description: dto.description || null,
        price: dto.price,
        category: dto.category || null,
        location: dto.location || null,
        lastPolicyCheck: this.buildDraftOptions(dto.rubric, dto.priceOption, dto.media) as any,
        stockQuantity: dto.stockQuantity ?? 0,
        publishStatus: 'draft',
      },
    });

    this.logger.log('Bazos ad draft created', { adId: ad.id, identityId: dto.identityId, userId });
    return ad;
  }

  async createDraftFromCatalog(userId: string, dto: CreateBazosAdDraftFromCatalogDto) {
    return this.createDraft(userId, {
      identityId: dto.identityId,
      productId: dto.productId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      rubric: dto.rubric,
      priceOption: dto.priceOption,
      category: dto.category,
      location: dto.location,
      stockQuantity: dto.stockQuantity ?? 0,
      media: dto.media,
    });
  }

  /**
   * Update ad content in the local workspace.
   * Drafts remain directly editable. Published ads may be changed locally so
   * operators can then apply the prepared update through the verified Bazoš flow.
   */
  async updateDraft(id: string, userId: string, dto: UpdateBazosAdDraftDto) {
    const ad = await this.findByIdForUser(id, userId);
    const status = String(ad.publishStatus || 'draft').toLowerCase();
    const editableStatuses = ['draft', 'published', 'active'];
    if (!editableStatuses.includes(status) && !ad.bazosAdId) {
      throw new BadRequestException('Only draft or published ads can be edited');
    }

    return this.prisma.bazosAd.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        location: dto.location,
        stockQuantity: dto.stockQuantity,
        ...(dto.rubric || dto.priceOption || dto.media || ad.bazosAdId ? { lastPolicyCheck: this.buildUpdatedPolicyState(ad, dto) as any } : {}),
      },
    });
  }

  /**
   * Evaluate policy gates for a draft. Returns the full gate result so the caller
   * can surface each failure reason to the user before attempting to enqueue.
   * Does NOT submit to Bazos.
   */
  async evaluatePublishPolicy(id: string, userId: string) {
    const ad = await this.findByIdForUser(id, userId);
    if (!ad.identityId) {
      throw new BadRequestException('Ad has no linked Bazos identity');
    }
    if (!ad.category) {
      throw new BadRequestException('Ad must have a Bazos category before policy evaluation');
    }

    const result = await this.policy.evaluate({
      identityId: ad.identityId,
      bazosCategory: ad.category,
      productId: ad.productId || '',
      adTitle: ad.title,
    });

    const draftOptions = (ad?.lastPolicyCheck as any)?.draftOptions || {};
    await this.prisma.bazosAd.update({
      where: { id },
      data: { lastPolicyCheck: { ...result, draftOptions } as any },
    });

    return result;
  }

  /**
   * Record a challenge state on both the ad and the linked identity.
   * Stops automation without bypassing anything.
   */
  async recordChallenge(id: string, userId: string, challengeState: string, error?: string) {
    const allowedChallenges = Object.values(REVIEW_STATE).filter((s) => s !== REVIEW_STATE.CLEAR);
    if (!allowedChallenges.includes(challengeState as any)) {
      throw new BadRequestException(`Unknown challenge state: ${challengeState}`);
    }

    const ad = await this.findByIdForUser(id, userId);

    await this.prisma.bazosAd.update({
      where: { id },
      data: {
        challengeState,
        publishStatus: 'challenge',
      },
    });

    if (ad.identityId) {
      await this.prisma.bazosIdentity.update({
        where: { id: ad.identityId },
        data: {
          reviewState: challengeState,
          sessionState: 'challenge',
        },
      });
    }

    this.logger.warn('Bazos challenge recorded on ad and identity', {
      adId: id,
      identityId: ad.identityId,
      challengeState,
      error,
    });
  }

  async findMany(userId: string, query: { isActive?: boolean; identityId?: string; productId?: string }) {
    const identitiesForUser = await this.prisma.bazosIdentity.findMany({
      where: { userId },
      select: { id: true },
    });
    const identityIds = identitiesForUser.map((i) => i.id);

    return this.prisma.bazosAd.findMany({
      where: {
        identityId: { in: query.identityId ? [query.identityId] : identityIds },
        ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
        ...(query.productId ? { productId: query.productId } : {}),
      },
      include: {
        publishAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    return this.findByIdForUser(id, userId);
  }


  private buildDraftOptions(rubric?: string, priceOption?: string, media?: any[]) {
    return {
      draftOptions: {
        rubric: rubric || null,
        priceOption: priceOption || 'fixed_price',
        media: this.normalizeMediaOverrides(media),
      },
    };
  }

  private buildUpdatedPolicyState(ad: any, dto: UpdateBazosAdDraftDto) {
    const current = ad?.lastPolicyCheck && typeof ad.lastPolicyCheck === 'object' ? ad.lastPolicyCheck : {};
    const currentOptions = (current as any).draftOptions || (current as any).submissionOptions || {};
    return {
      ...(current as any),
      draftOptions: {
        rubric: dto.rubric || currentOptions.rubric || null,
        priceOption: dto.priceOption || currentOptions.priceOption || 'fixed_price',
        media: this.normalizeMediaOverrides(dto.media || currentOptions.media),
      },
      ...(ad?.bazosAdId ? {
        pendingBazosUpdate: {
          required: true,
          savedAt: new Date().toISOString(),
          bazosAdId: ad.bazosAdId,
        },
      } : {}),
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

  private async findByIdForUser(id: string, userId: string) {
    const identitiesForUser = await this.prisma.bazosIdentity.findMany({
      where: { userId },
      select: { id: true },
    });
    const identityIds = identitiesForUser.map((i) => i.id);

    const ad = await this.prisma.bazosAd.findFirst({
      where: { id, identityId: { in: identityIds } },
    });
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }
}
