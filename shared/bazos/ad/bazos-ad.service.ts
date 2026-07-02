import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { PublishPolicyService } from '../policy/publish-policy.service';
import { CreateBazosAdDraftDto, CreateBazosAdDraftFromCatalogDto, UpdateBazosAdDraftDto } from './bazos-ad.dto';
import { REVIEW_STATE } from '../identity/bazos-identity.types';
import { CatalogClientService } from '../../clients/catalog-client.service';

const DEFAULT_BAZOS_LISTING_LIFETIME_DAYS = 30;
const BAZOS_CATALOG_TAGS = ['bazos', 'bazos-draft'];
const BAZOS_MEDIA_LIMIT = 20;

@Injectable()
export class BazosAdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly policy: PublishPolicyService,
    private readonly catalogClient?: CatalogClientService,
  ) {}

  /**
   * Create a local ad draft. No Bazos submission happens here.
   * The identityId must belong to an identity owned by the requesting user.
   */
  async createDraft(userId: string, dto: CreateBazosAdDraftDto, authorization?: string) {
    const identity = await this.prisma.bazosIdentity.findFirst({
      where: { id: dto.identityId, userId },
    });
    if (!identity) {
      throw new NotFoundException('Bazos identity not found for this user');
    }
    if (!identity.accountId) {
      throw new BadRequestException('Identity must be linked to a Bazos account before creating ads');
    }

    const media = this.normalizeMedia(dto.media);
    if (!media.length) {
      throw new BadRequestException('At least one photo URL is required before creating a Bazos ad');
    }

    const productId = dto.productId || (dto.saveToCatalog ? await this.ensureCatalogProduct(userId, dto, authorization) : null);

    const ad = await this.prisma.bazosAd.create({
      data: {
        accountId: identity.accountId,
        identityId: dto.identityId,
        productId,
        title: dto.title,
        description: dto.description || null,
        price: dto.price,
        category: dto.category || null,
        location: dto.location || null,
        lastPolicyCheck: this.buildDraftOptions(dto.rubric, dto.priceOption, media) as any,
        stockQuantity: dto.stockQuantity ?? 0,
        publishStatus: 'draft',
      },
    });

    if (dto.saveToCatalog && productId) {
      await this.attachBazosDraftTag(productId, ad.id, authorization);
    }

    this.logger.log('Bazos ad draft created', { adId: ad.id, identityId: dto.identityId, userId });
    return ad;
  }

  async createDraftWithUploadedMedia(userId: string, dto: CreateBazosAdDraftDto, files: any[] = [], authorization?: string) {
    const normalizedFiles = files.slice(0, Math.max(0, BAZOS_MEDIA_LIMIT - this.normalizeMedia(dto.media).length));
    if (!normalizedFiles.length) {
      return this.createDraft(userId, dto, authorization);
    }
    if (!this.catalogClient) {
      throw new BadRequestException('Catalog integration is required before uploading Bazos photos');
    }

    const productId = dto.productId || await this.ensureCatalogProduct(userId, dto, authorization);
    const existingMedia = this.normalizeMedia(dto.media);
    const uploadedMedia = [];
    for (const [index, file] of normalizedFiles.entries()) {
      const position = existingMedia.length + index;
      const uploaded = await this.catalogClient.uploadMedia(file, {
        productId,
        altText: dto.title,
        position,
        isPrimary: position === 0,
      }, authorization);
      if (uploaded?.url) {
        uploadedMedia.push({
          id: uploaded.id || uploaded.url,
          url: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl || uploaded.url,
          altText: uploaded.altText || dto.title,
          title: uploaded.title || file.originalname || dto.title,
          position,
        });
      }
    }

    return this.createDraft(userId, {
      ...dto,
      productId,
      saveToCatalog: true,
      media: [...existingMedia, ...uploadedMedia],
    }, authorization);
  }

  async createDraftFromCatalog(userId: string, dto: CreateBazosAdDraftFromCatalogDto, authorization?: string) {
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
      brand: dto.brand,
      manufacturer: dto.manufacturer,
      ean: dto.ean,
      weightKg: dto.weightKg,
      dimensionsCm: dto.dimensionsCm,
      media: dto.media,
    }, authorization);
  }

  private async ensureCatalogProduct(userId: string, dto: CreateBazosAdDraftDto, authorization?: string): Promise<string> {
    if (!this.catalogClient) {
      throw new BadRequestException('Catalog integration is not available for Bazos draft creation');
    }

    const existing = await this.findSimilarCatalogProduct(dto.title, authorization);
    if (existing?.id) {
      await this.markCatalogProductAsBazosVersion(existing, dto, authorization, userId);
      await this.syncCatalogMedia(existing.id, dto, authorization);
      return existing.id;
    }

    const product = await this.catalogClient.createProduct(this.catalogPayload(dto), authorization);
    if (!product?.id) {
      throw new BadRequestException('Catalog product was not created for this Bazos ad');
    }
    await this.syncCatalogMedia(product.id, dto, authorization);
    return product.id;
  }

  private async findSimilarCatalogProduct(title: string, authorization?: string): Promise<any | null> {
    if (!this.catalogClient) return null;
    const normalizedTitle = this.normalizeCatalogText(title);
    const result = await this.catalogClient.searchProducts({ search: title, isActive: true, limit: 10, ...(authorization ? { catalogScope: 'own' as const } : {}) }, authorization);
    return (result.items || []).find((product) => {
      const candidate = this.normalizeCatalogText(product?.title);
      return candidate === normalizedTitle || candidate.includes(normalizedTitle) || normalizedTitle.includes(candidate);
    }) || null;
  }

  private async markCatalogProductAsBazosVersion(product: any, dto: CreateBazosAdDraftDto, authorization?: string, userId?: string) {
    if (!this.catalogClient || !product?.id) return;
    await this.catalogClient.updateProduct(product.id, {
      tags: this.mergeTags(product.tags, BAZOS_CATALOG_TAGS),
      seoData: this.mergeSeoData(product.seoData, dto),
      ...(dto.resaleEnabled !== undefined && this.isCatalogProductOwner(product, userId) ? { resaleEnabled: Boolean(dto.resaleEnabled) } : {}),
    }, authorization);
  }

  private async attachBazosDraftTag(productId: string, adId: string, authorization?: string) {
    if (!this.catalogClient) return;
    try {
      const product = await this.catalogClient.getProductById(productId);
      await this.catalogClient.updateProduct(productId, {
        tags: this.mergeTags(product?.tags, [...BAZOS_CATALOG_TAGS, `bazos-ad:${adId}`]),
        seoData: {
          ...(product?.seoData || {}),
          metaTitle: product?.seoData?.metaTitle || product?.title,
          keywords: this.mergeTags(product?.seoData?.keywords, ['bazos', `bazos-ad:${adId}`]),
        },
      }, authorization);
    } catch (error: any) {
      this.logger.warn('Bazos draft was created but catalog product tagging failed', {
        productId,
        adId,
        error: error?.message || String(error),
      });
    }
  }

  private catalogPayload(dto: CreateBazosAdDraftDto) {
    return {
      sku: this.bazosCatalogSku(dto.title),
      title: dto.title,
      description: dto.description || undefined,
      isActive: true,
      lifecycle: 'active',
      tags: BAZOS_CATALOG_TAGS,
      brand: dto.brand || undefined,
      manufacturer: dto.manufacturer || undefined,
      ean: dto.ean || undefined,
      weightKg: dto.weightKg || undefined,
      dimensionsCm: dto.dimensionsCm || undefined,
      seoData: this.mergeSeoData(null, dto),
      ...(dto.resaleEnabled !== undefined ? { resaleEnabled: Boolean(dto.resaleEnabled) } : {}),
    };
  }

  private isCatalogProductOwner(product: any, userId?: string) {
    const ownerUserId = product?.ownerUserId ?? product?.owner_user_id ?? product?.ownerId ?? product?.owner?.userId ?? product?.owner?.id;
    return Boolean(userId && ownerUserId && String(ownerUserId) === String(userId));
  }

  private async syncCatalogMedia(productId: string, dto: CreateBazosAdDraftDto, authorization?: string) {
    if (!this.catalogClient) return;
    const media = this.normalizeMedia(dto.media);
    for (const item of media) {
      await this.catalogClient.createMedia({
        productId,
        type: 'image',
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || item.url,
        altText: item.altText || dto.title,
        title: item.title || item.altText || dto.title,
        position: item.position,
        isPrimary: item.position === 0,
      }, authorization);
    }
  }

  private normalizeMedia(media?: any[]) {
    return (Array.isArray(media) ? media : [])
      .filter((item) => item && typeof item.url === 'string' && /^https?:\/\//i.test(item.url))
      .slice(0, BAZOS_MEDIA_LIMIT)
      .map((item, index) => ({
        id: item.id || item.url,
        url: item.url.trim(),
        thumbnailUrl: item.thumbnailUrl || item.url,
        altText: item.altText || item.title || '',
        title: item.title || item.altText || '',
        position: Number.isFinite(Number(item.position)) ? Number(item.position) : index,
      }));
  }

  private mergeSeoData(existing: any, dto: CreateBazosAdDraftDto) {
    return {
      ...(existing || {}),
      metaTitle: existing?.metaTitle || dto.title,
      metaDescription: existing?.metaDescription || dto.description || undefined,
      keywords: this.mergeTags(existing?.keywords, ['bazos', 'bazos-version', dto.category].filter(Boolean) as string[]),
    };
  }

  private mergeTags(existing: unknown, additions: string[]) {
    return Array.from(new Set([...(Array.isArray(existing) ? existing.map(String) : []), ...additions].filter(Boolean)));
  }

  private normalizeCatalogText(value: unknown) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private bazosCatalogSku(title: string) {
    const slug = this.normalizeCatalogText(title).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'inzerat';
    return `BAZOS-${slug}-${Date.now().toString(36)}`;
  }

  /**
   * Update ad content in the local workspace.
   * Drafts remain directly editable. Published or deleted ads may be changed locally so
   * operators can then apply the prepared update through the verified Bazoš flow.
   */
  async updateDraft(id: string, userId: string, dto: UpdateBazosAdDraftDto) {
    const ad = await this.findByIdForUser(id, userId);
    const status = String(ad.publishStatus || 'draft').toLowerCase();
    const editableStatuses = ['draft', 'published', 'active', 'deleted'];
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

    const ads = await this.prisma.bazosAd.findMany({
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
    return this.resolvePendingBazosUpdates(ads);
  }

  async findById(id: string, userId: string) {
    const ad = await this.findByIdForUser(id, userId);
    return this.resolveBazosStateOnOpen(ad);
  }

  async refreshExternalStatuses(userId: string) {
    const identitiesForUser = await this.prisma.bazosIdentity.findMany({
      where: { userId },
      select: { id: true, activeAdCount: true },
    });
    const identityIds = identitiesForUser.map((identity) => identity.id);
    const ads = await this.prisma.bazosAd.findMany({
      where: {
        identityId: { in: identityIds },
        isActive: true,
        bazosAdId: { not: null },
        publishStatus: { in: ['published', 'active'] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const checked = [];
    for (const ad of ads) {
      const check = await this.fetchBazosPublicStatus(ad).catch((error) => {
        this.logger.warn('Unable to refresh public Bazos listing status', {
          adId: ad.id,
          bazosAdId: ad.bazosAdId,
          error: error?.message || String(error),
        });
        return { available: null as boolean | null, updatedAt: null as Date | null, reason: 'request_failed' };
      });
      if (check.available === false) {
        await this.markDeletedOnBazos(ad, check.reason || 'not_available');
      } else if (check.available === true) {
        await this.syncFromPublicListing(ad, check);
      }
      checked.push({
        adId: ad.id,
        bazosAdId: ad.bazosAdId,
        available: check.available,
        reason: check.reason,
      });
    }

    await this.reconcileIdentityCounts(identityIds);

    this.logger.log('Bazos public listing statuses refreshed', {
      userId,
      checked: checked.length,
      deleted: checked.filter((item) => item.available === false).length,
      unknown: checked.filter((item) => item.available === null).length,
    });

    return {
      refreshedAt: new Date(),
      checked: checked.length,
      deleted: checked.filter((item) => item.available === false).length,
      unknown: checked.filter((item) => item.available === null).length,
      ads: await this.findMany(userId, {}),
      checks: checked,
    };
  }


  async recordBazosManageOpened(id: string, userId: string) {
    const ad = await this.findByIdForUser(id, userId);
    if (!ad.bazosAdId) {
      throw new BadRequestException('Ad has no Bazoš public identifier yet');
    }
    if (String(ad.publishStatus || '').toLowerCase() === 'deleted') {
      throw new BadRequestException('Deleted Bazoš ads can be published again instead of managed');
    }

    const current = this.jsonObject(ad.lastPolicyCheck);
    const now = new Date();
    return this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: {
        lastPolicyCheck: {
          ...current,
          bazosAvailabilityCheck: {
            ...this.jsonObject((current as any).bazosAvailabilityCheck),
            enabled: true,
            source: 'manage_opened',
            lastManageOpenedAt: now.toISOString(),
            nextCheckAt: this.nextAvailabilityCheckAt(now).toISOString(),
          },
        } as any,
      },
    });
  }

  async refreshDueExternalStatus() {
    const candidates = await this.prisma.bazosAd.findMany({
      where: {
        bazosAdId: { not: null },
        publishStatus: { in: ['published', 'active'] },
      },
      orderBy: { updatedAt: 'asc' },
      take: 100,
    });
    const now = new Date();
    const due = candidates.find((ad) => this.isAvailabilityCheckDue(ad, now));
    if (!due) return { checked: 0, deleted: 0, unknown: 0, reason: 'no_due_ads' };

    const check = await this.fetchBazosPublicStatus(due).catch((error) => {
      this.logger.warn('Unable to refresh due public Bazos listing status', {
        adId: due.id,
        bazosAdId: due.bazosAdId,
        error: error?.message || String(error),
      });
      return { available: null as boolean | null, updatedAt: null as Date | null, reason: 'request_failed' };
    });

    if (check.available === false) {
      await this.markDeletedOnBazos(due, check.reason || 'not_available');
    } else if (check.available === true) {
      const updated = await this.syncFromPublicListing(due, check);
      await this.scheduleNextAvailabilityCheck(updated, now, 'checked_available');
    } else {
      await this.scheduleNextAvailabilityCheck(due, now, check.reason || 'unknown');
    }
    if (due.identityId) await this.reconcileIdentityCounts([due.identityId]);

    return {
      checked: 1,
      deleted: check.available === false ? 1 : 0,
      unknown: check.available === null ? 1 : 0,
      adId: due.id,
      reason: check.reason,
    };
  }

  private async resolveBazosStateOnOpen(ad: any) {
    const pendingResolved = await this.resolvePendingBazosUpdate(ad);
    return this.refreshManagedListingOnOpen(pendingResolved);
  }

  private async refreshManagedListingOnOpen(ad: any) {
    const current = this.jsonObject(ad?.lastPolicyCheck);
    const checkState = this.jsonObject((current as any).bazosAvailabilityCheck);
    if ((checkState as any).enabled !== true) return ad;

    const now = new Date();
    if (String(ad.publishStatus || '').toLowerCase() === 'deleted') {
      return this.disableAvailabilityCheck(ad, 'already_deleted', now);
    }
    if (this.isManagedAvailabilityTrackingExpired(ad, now)) {
      return this.disableAvailabilityCheck(ad, 'tracking_expired', now);
    }

    const publicStatus = await this.fetchBazosPublicStatus(ad).catch((error) => {
      this.logger.warn('Unable to refresh managed public Bazos listing on open', {
        adId: ad.id,
        bazosAdId: ad.bazosAdId,
        error: error?.message || String(error),
      });
      return { available: null as boolean | null, updatedAt: null as Date | null, reason: 'request_failed' };
    });

    if (publicStatus.available === false) {
      const deleted = await this.markDeletedOnBazos(ad, publicStatus.reason || 'not_available');
      if (deleted.identityId) await this.reconcileIdentityCounts([deleted.identityId]);
      return deleted;
    }
    if (publicStatus.available === true) {
      const synced = await this.syncFromPublicListing(ad, publicStatus);
      return this.scheduleNextAvailabilityCheck(synced, now, 'checked_on_open');
    }
    return this.scheduleNextAvailabilityCheck(ad, now, publicStatus.reason || 'unknown_on_open');
  }

  private async resolvePendingBazosUpdate(ad: any) {
    const pending = ad?.lastPolicyCheck?.pendingBazosUpdate;
    if (!pending?.required || !pending?.savedAt || !ad?.bazosAdId) return ad;

    const publicStatus = await this.fetchBazosPublicStatus(ad).catch((error) => {
      this.logger.warn('Unable to verify public Bazos update timestamp', { adId: ad.id, bazosAdId: ad.bazosAdId, error: error?.message || String(error) });
      return { available: null as boolean | null, updatedAt: null as Date | null, reason: 'request_failed' };
    });
    if (publicStatus.available === false) return this.markDeletedOnBazos(ad, publicStatus.reason || 'not_available');
    const externalUpdatedAt = publicStatus.updatedAt;
    if (!this.isExternalUpdateFreshEnough(pending.savedAt, externalUpdatedAt)) return ad;

    const { pendingBazosUpdate, ...rest } = ad.lastPolicyCheck || {};
    return this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: {
        lastPolicyCheck: {
          ...rest,
          bazosUpdateVerifiedAt: new Date().toISOString(),
          bazosPublicUpdatedAt: externalUpdatedAt?.toISOString(),
          previousPendingBazosUpdate: pendingBazosUpdate,
        } as any,
      },
    });
  }

  private async resolvePendingBazosUpdates(ads: any[]) {
    return Promise.all(ads.map((ad) => this.resolvePendingBazosUpdate(ad)));
  }

  private isExternalUpdateFreshEnough(savedAtValue: string, externalUpdatedAt: Date | null) {
    const savedAt = new Date(savedAtValue);
    if (!externalUpdatedAt || Number.isNaN(savedAt.getTime())) return false;
    const savedDate = Date.UTC(savedAt.getUTCFullYear(), savedAt.getUTCMonth(), savedAt.getUTCDate());
    const externalDate = Date.UTC(externalUpdatedAt.getUTCFullYear(), externalUpdatedAt.getUTCMonth(), externalUpdatedAt.getUTCDate());
    return externalDate >= savedDate;
  }

  private async fetchBazosPublicUpdatedAt(ad: any): Promise<Date | null> {
    return (await this.fetchBazosPublicStatus(ad)).updatedAt;
  }

  private async fetchBazosPublicStatus(ad: any): Promise<{ available: boolean | null; updatedAt: Date | null; reason?: string; listing?: any }> {
    const publicUrl = this.bazosPublicUrl(ad);
    if (!publicUrl) return { available: null, updatedAt: null, reason: 'missing_public_url' };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(publicUrl, {
        signal: controller.signal,
        headers: { 'user-agent': 'Mozilla/5.0 Bazos-Service/1.0' },
      });
      if (response.status === 404 || response.status === 410) {
        return { available: false, updatedAt: null, reason: 'http_' + response.status };
      }
      if (!response.ok) return { available: null, updatedAt: null, reason: 'http_' + response.status };
      const html = await response.text();
      if (this.isBazosDeletedPage(html)) return { available: false, updatedAt: null, reason: 'deleted_page' };
      return { available: true, updatedAt: this.parseBazosUpdatedDate(html), listing: this.parseBazosPublicListing(html, publicUrl) };
    } finally {
      clearTimeout(timeout);
    }
  }

  private async markDeletedOnBazos(ad: any, reason: string) {
    const current = this.jsonObject(ad?.lastPolicyCheck);
    return this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: {
        isActive: false,
        publishStatus: 'deleted',
        lastPolicyCheck: {
          ...(current as any),
          bazosDeletionVerifiedAt: new Date().toISOString(),
          bazosDeletionReason: reason,
          previousPublishStatus: ad.publishStatus,
          bazosAvailabilityCheck: {
            ...this.jsonObject((current as any).bazosAvailabilityCheck),
            enabled: false,
            lastCheckedAt: new Date().toISOString(),
            lastReason: reason,
          },
        } as any,
      },
    });
  }

  private async disableAvailabilityCheck(ad: any, reason: string, at = new Date()) {
    const current = this.jsonObject(ad?.lastPolicyCheck);
    const check = this.jsonObject((current as any).bazosAvailabilityCheck);
    if ((check as any).enabled !== true) return ad;
    return this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: {
        lastPolicyCheck: {
          ...current,
          bazosAvailabilityCheck: {
            ...check,
            enabled: false,
            stoppedAt: at.toISOString(),
            lastCheckedAt: at.toISOString(),
            lastReason: reason,
          },
        } as any,
      },
    });
  }

  private async reconcileIdentityCounts(identityIds: string[]) {
    for (const identityId of identityIds) {
      const activeAdCount = await this.prisma.bazosAd.count({
        where: { identityId, isActive: true, publishStatus: { in: ['published', 'active'] } },
      });
      await this.prisma.bazosIdentity.update({ where: { id: identityId }, data: { activeAdCount } });
    }
  }

  private bazosPublicUrl(ad: any) {
    const raw = String(ad?.bazosAdId || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw.replace('/smazat/', '/inzerat/');
    const match = raw.match(/[0-9]{5,}/);
    if (!match) return '';
    return `https://www.bazos.cz/inzerat/${encodeURIComponent(match[0])}/`;
  }


  private async syncFromPublicListing(ad: any, check: { updatedAt: Date | null; listing?: any }) {
    const listing = check.listing || {};
    const data: any = {};
    if (listing.title && listing.title !== ad.title) data.title = listing.title;
    if (listing.description && listing.description !== (ad.description || '')) data.description = listing.description;
    if (Number.isFinite(listing.price) && Number(listing.price) !== Number(ad.price)) data.price = listing.price;
    if (listing.category && listing.category !== ad.category) data.category = listing.category;
    if (listing.location && listing.location !== ad.location) data.location = listing.location;

    const current = this.jsonObject(ad.lastPolicyCheck);
    data.lastPolicyCheck = {
      ...current,
      bazosLastSyncedAt: new Date().toISOString(),
      bazosPublicUpdatedAt: check.updatedAt?.toISOString() || (current as any).bazosPublicUpdatedAt,
      bazosPublicSnapshot: {
        title: listing.title || null,
        price: Number.isFinite(listing.price) ? listing.price : null,
        category: listing.category || null,
        location: listing.location || null,
        sourceUrl: listing.sourceUrl || this.bazosPublicUrl(ad),
      },
    } as any;
    return this.prisma.bazosAd.update({ where: { id: ad.id }, data });
  }

  private parseBazosPublicListing(html: string, sourceUrl: string) {
    const text = (value: string) => this.decodeHtml(value)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t\r\f\v]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();
    const title = this.firstMatch(html, [
      /<h1[^>]*class=["'][^"']*nadpisdetail[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i,
      /<h1[^>]*>([\s\S]*?)<\/h1>/i,
      /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
      /<title>([\s\S]*?)\s+bazar\s+-/i,
    ]);
    const description = this.firstMatch(html, [
      /<div[^>]*class=["'][^"']*popisdetail[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
    ]);
    const priceText = this.firstMatch(html, [
      /Cena:\s*<\/[^>]+>\s*<[^>]+>([^<]+)</i,
      /<td[^>]*>\s*Cena\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i,
      /(?:Cena|cena)[^0-9]{0,40}([0-9][0-9 .,&nbsp;]*)(?:Kč|CZK)/i,
    ]);
    const location = this.firstMatch(html, [
      /Lokalita:\s*<\/[^>]+>\s*<[^>]+>([\s\S]*?)<\/[^>]+>/i,
      /<td[^>]*>\s*Lokalita\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i,
      /Okres:\s*<\/[^>]+>\s*<[^>]+>([\s\S]*?)<\/[^>]+>/i,
    ]);
    const category = this.firstMatch(html, [
      /<div[^>]*class=["']drobky["'][^>]*>[\s\S]*?<a[^>]*>\s*([^<]+)\s*<\/a>\s*>\s*<h1/i,
      /<h1[^>]*class=["']nadpiskategorie["'][^>]*>([\s\S]*?)<\/h1>/i,
    ]);

    return {
      title: this.cleanBazosTitle(text(title)),
      description: text(description),
      price: this.parseBazosPrice(text(priceText)),
      category: text(category),
      location: text(location),
      sourceUrl,
    };
  }

  private firstMatch(html: string, patterns: RegExp[]) {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1];
    }
    return '';
  }

  private cleanBazosTitle(value: string) {
    return value.replace(/\s+-\s+[^-]+\s*$/i, '').replace(/\s+bazar\s*$/i, '').trim();
  }

  private parseBazosPrice(value: string) {
    if (!/\d/.test(value || '')) return undefined;
    const normalized = value.replace(/&nbsp;/g, ' ').replace(/[^0-9.,]/g, '').replace(/[ .]/g, '').replace(',', '.');
    const price = Number(normalized);
    return Number.isFinite(price) ? price : undefined;
  }

  private decodeHtml(value: string) {
    return String(value || '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  private isManagedAvailabilityTrackingExpired(ad: any, now: Date) {
    const expiresAt = this.toValidDate(ad.expiresAt);
    if (expiresAt) return expiresAt <= now;
    const lastPublishedAt = this.toValidDate(ad.lastPublishedAt);
    if (!lastPublishedAt) return false;
    return new Date(lastPublishedAt.getTime() + DEFAULT_BAZOS_LISTING_LIFETIME_DAYS * 24 * 60 * 60_000) <= now;
  }

  private isAvailabilityCheckDue(ad: any, now: Date) {
    const state = this.jsonObject(ad.lastPolicyCheck);
    const check = this.jsonObject((state as any).bazosAvailabilityCheck);
    const enabled = (check as any).enabled === true;
    const nextCheckAt = this.toValidDate((check as any).nextCheckAt);
    if (enabled) return !nextCheckAt || nextCheckAt <= now;
    const expiresAt = this.toValidDate(ad.expiresAt);
    if (expiresAt) return expiresAt <= now;
    const lastPublishedAt = this.toValidDate(ad.lastPublishedAt);
    if (!lastPublishedAt) return false;
    return new Date(lastPublishedAt.getTime() + 14 * 24 * 60 * 60_000) <= now;
  }

  private async scheduleNextAvailabilityCheck(ad: any, from: Date, reason: string) {
    const current = this.jsonObject(ad.lastPolicyCheck);
    const check = this.jsonObject((current as any).bazosAvailabilityCheck);
    const nextCheckAt = (check as any).enabled === true
      ? this.nextAvailabilityCheckAt(from)
      : this.nextExpiryFallbackCheckAt(ad, from);
    return this.prisma.bazosAd.update({
      where: { id: ad.id },
      data: {
        lastPolicyCheck: {
          ...current,
          bazosAvailabilityCheck: {
            ...check,
            lastCheckedAt: from.toISOString(),
            lastReason: reason,
            nextCheckAt: nextCheckAt.toISOString(),
          },
        } as any,
      },
    });
  }

  private nextAvailabilityCheckAt(from: Date) {
    const jitterMinutes = Math.floor(Math.random() * 21) - 10;
    return new Date(from.getTime() + (60 + jitterMinutes) * 60_000);
  }

  private nextExpiryFallbackCheckAt(ad: any, from: Date) {
    const expiresAt = this.toValidDate(ad.expiresAt);
    if (expiresAt && expiresAt > from) return expiresAt;
    const lastPublishedAt = this.toValidDate(ad.lastPublishedAt);
    if (lastPublishedAt) return new Date(lastPublishedAt.getTime() + DEFAULT_BAZOS_LISTING_LIFETIME_DAYS * 24 * 60 * 60_000);
    return this.nextAvailabilityCheckAt(from);
  }

  private toValidDate(value: any) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
  }

  private jsonObject(value: any): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  private parseBazosUpdatedDate(html: string): Date | null {
    const text = html.replace(/&nbsp;/g, ' ');
    const match = text.match(/\b(\d{1,2})\.(\d{1,2})\.\s*(\d{4})\b/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (!day || !month || !year) return null;
    return new Date(Date.UTC(year, month - 1, day));
  }

  private isBazosDeletedPage(html: string) {
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/&nbsp;/g, ' ')
      .toLowerCase();
    return [
      'inzerat neexistuje',
      'inzerat nenalezen',
      'inzerat je jiz vymazan',
      'inzerat byl smazan',
      'inzerat byl vymazan',
      'stranka nenalezena',
    ].some((marker) => text.includes(marker));
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
