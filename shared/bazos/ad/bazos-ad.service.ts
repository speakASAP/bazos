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
        lastPolicyCheck: this.buildDraftOptions(dto.rubric, dto.priceOption) as any,
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
    });
  }

  /**
   * Update draft content. Only drafts may be edited.
   */
  async updateDraft(id: string, userId: string, dto: UpdateBazosAdDraftDto) {
    const ad = await this.findByIdForUser(id, userId);
    if (ad.publishStatus !== 'draft') {
      throw new BadRequestException('Only draft ads can be edited');
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
        ...(dto.rubric || dto.priceOption ? { lastPolicyCheck: this.buildDraftOptions(dto.rubric, dto.priceOption) as any } : {}),
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

    await this.prisma.bazosAd.update({
      where: { id },
      data: { lastPolicyCheck: result as any },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    return this.findByIdForUser(id, userId);
  }


  private buildDraftOptions(rubric?: string, priceOption?: string) {
    return {
      draftOptions: {
        rubric: rubric || null,
        priceOption: priceOption || 'fixed_price',
      },
    };
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
