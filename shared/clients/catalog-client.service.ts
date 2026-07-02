import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

type CatalogScope = 'own' | 'effective' | 'alfares' | 'community' | 'all';

/**
 * API client for catalog-microservice
 * Fetches product data from the central catalog
 */
@Injectable()
export class CatalogClientService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {
    this.baseUrl = process.env.CATALOG_SERVICE_URL || 'http://catalog-microservice:3200';
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string, authorization?: string, catalogScope?: CatalogScope): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (catalogScope) params.set('catalogScope', catalogScope);
      const queryString = params.toString();
      const productPath = `${this.baseUrl}/api/products/${encodeURIComponent(productId)}${queryString ? `?${queryString}` : ''}`;
      const response = await firstValueFrom(
        this.httpService.get(productPath, this.authOptions(authorization))
      );
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get product ${productId}: ${errorMessage}`, errorStack, 'CatalogClient');
      throw new HttpException(`Product not found: ${productId}`, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get marketplace-ready canonical content preview for a product
   */
  async getProductContentPreview(productId: string, marketplace: string, authorization?: string): Promise<any | null> {
    const cleanProductId = productId.trim();
    const cleanMarketplace = marketplace.trim();
    if (!cleanProductId || !cleanMarketplace) return null;

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/products/${encodeURIComponent(cleanProductId)}/content-previews/${encodeURIComponent(cleanMarketplace)}`,
          this.authOptions(authorization),
        )
      );
      if (!response.data?.success || !response.data?.data) {
        return null;
      }
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Content preview not found for product ${cleanProductId} marketplace ${cleanMarketplace}: ${errorMessage}`,
        'CatalogClient',
      );
      return null;
    }
  }

  /**
   * Get product readiness diagnostics from Catalog product truth.
   */
  async getProductReadiness(productId: string, authorization?: string): Promise<any> {
    const cleanProductId = productId.trim();
    if (!cleanProductId) {
      throw new HttpException('Catalog product id is required for readiness check', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/products/${encodeURIComponent(cleanProductId)}/readiness`,
          this.authOptions(authorization),
        )
      );
      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Catalog readiness request was rejected');
      }
      return response.data?.data || response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Product readiness unavailable for ${cleanProductId}: ${errorMessage}`, 'CatalogClient');
      throw new HttpException('Catalog product readiness unavailable', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/products/sku/${sku}`)
      );
      if (!response.data.success || !response.data.data) {
        return null;
      }
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Product not found by SKU ${sku}: ${errorMessage}`, 'CatalogClient');
      return null;
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: {
    search?: string;
    isActive?: boolean;
    categoryId?: string;
    catalogScope?: CatalogScope;
    page?: number;
    limit?: number;
  }, authorization?: string): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.isActive !== undefined) params.append('isActive', String(query.isActive));
      if (query.categoryId) params.append('categoryId', query.categoryId);
      if (query.catalogScope) params.append('catalogScope', query.catalogScope);
      if (query.page) params.append('page', String(query.page));
      if (query.limit) params.append('limit', String(query.limit));

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/products?${params.toString()}`, this.authOptions(authorization))
      );
      return {
        items: response.data.data || [],
        total: response.data.pagination?.total || 0,
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 20,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to search products: ${errorMessage}`, errorStack, 'CatalogClient');
      return { items: [], total: 0, page: 1, limit: 20 };
    }
  }

  /**
   * Provision idempotent user Catalog access after hosted Auth login.
   */
  async provisionAccess(authorization: string, sourceApplication = 'bazos'): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/api/catalog/access/provision`,
          { sourceApplication },
          this.authOptions(authorization),
        )
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to provision Catalog access: ${errorMessage}`, 'CatalogClient');
      throw new HttpException('Failed to provision Catalog access', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Create product in catalog
   */
  async createProduct(productData: any, authorization?: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/products`, productData, this.authOptions(authorization))
      );
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create product: ${errorMessage}`, errorStack, 'CatalogClient');
      throw new HttpException(`Failed to create product: ${errorMessage}`, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Update product in catalog
   */
  async updateProduct(productId: string, productData: any, authorization?: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/products/${productId}`, productData, this.authOptions(authorization))
      );
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to update product ${productId}: ${errorMessage}`, errorStack, 'CatalogClient');
      throw new HttpException(`Failed to update product: ${errorMessage}`, HttpStatus.BAD_REQUEST);
    }
  }


  /**
   * Upload product media file to catalog storage
   */
  async uploadMedia(file: any, data: { productId: string; altText?: string; position?: number; isPrimary?: boolean }, authorization?: string): Promise<any> {
    try {
      const formData = new (globalThis as any).FormData();
      const blob = new (globalThis as any).Blob([file.buffer], { type: file.mimetype || 'application/octet-stream' });
      formData.append('file', blob, file.originalname || 'bazos-photo.jpg');
      formData.append('productId', data.productId);
      if (data.altText) formData.append('altText', data.altText);
      if (Number.isFinite(data.position)) formData.append('position', String(data.position));
      if (data.isPrimary !== undefined) formData.append('isPrimary', String(Boolean(data.isPrimary)));
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/media/upload`, formData, this.authOptions(authorization))
      );
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.warn(`Failed to upload product media: ${errorMessage}`, 'CatalogClient');
      if (errorStack) this.logger.warn(errorStack, 'CatalogClient');
      return null;
    }
  }

  /**
   * Create external media reference for product
   */
  async createMedia(mediaData: any, authorization?: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/media`, mediaData, this.authOptions(authorization))
      );
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.warn(`Failed to create product media reference: ${errorMessage}`, 'CatalogClient');
      if (errorStack) this.logger.warn(errorStack, 'CatalogClient');
      return null;
    }
  }

  /**
   * Get product pricing
   */
  async getProductPricing(productId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/pricing/product/${productId}/current`)
      );
      return response.data.data;
    } catch (error) {
      this.logger.warn(`Pricing not found for product ${productId}`, 'CatalogClient');
      return null;
    }
  }

  /**
   * Get product media
   */
  async getProductMedia(productId: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/media/product/${productId}`)
      );
      return response.data.data || [];
    } catch (error) {
      this.logger.warn(`Media not found for product ${productId}`, 'CatalogClient');
      return [];
    }
  }

  private authOptions(authorization?: string) {
    const headers: Record<string, string> = {};
    if (authorization) headers.Authorization = authorization;

    const internalToken = process.env.CATALOG_INTERNAL_SERVICE_TOKEN || process.env.INTERNAL_SERVICE_TOKEN;
    if (internalToken) {
      headers['x-internal-service-token'] = internalToken;
      headers['x-service-name'] = 'bazos-service';
    }

    return Object.keys(headers).length ? { headers } : undefined;
  }
}

