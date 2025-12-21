import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService, CatalogClientService, WarehouseClientService } from '@bazos/shared';

@Injectable()
export class OffersService {
  private readonly logger: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogClient: CatalogClientService,
    private readonly warehouseClient: WarehouseClientService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('OffersService');
  }

  async findAll(query: any) {
    return this.prisma.bazosOffer.findMany({
      where: {
        isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
        accountId: query.accountId,
      },
      include: {
        account: true,
      },
    });
  }

  async findOne(id: string) {
    const offer = await this.prisma.bazosOffer.findUnique({
      where: { id },
      include: { account: true },
    });

    if (offer && offer.productId) {
      try {
        const product = await this.catalogClient.getProductById(offer.productId);
        const stock = await this.warehouseClient.getTotalAvailable(offer.productId);
        return {
          ...offer,
          product,
          stock,
        };
      } catch (error: any) {
        this.logger.warn(`Failed to fetch product data for offer ${id}: ${error.message}`);
      }
    }

    return offer;
  }

  async create(data: any) {
    return this.prisma.bazosOffer.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.bazosOffer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.bazosOffer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async syncFromCatalog(data?: { accountId?: string; limit?: number; activeOnly?: boolean }) {
    try {
      const accountId = data?.accountId;
      const limit = data?.limit || 100;
      const activeOnly = data?.activeOnly !== false;

      if (!accountId) {
        throw new Error('accountId is required');
      }

      // Verify account exists
      const account = await this.prisma.bazosAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new Error(`Account ${accountId} not found`);
      }

      // Fetch products from catalog-microservice
      const catalogResult = await this.catalogClient.searchProducts({
        isActive: activeOnly,
        limit,
        page: 1,
      });

      const products = catalogResult.items;
      this.logger.log(`Syncing ${products.length} products from catalog to Bazos`, { accountId });

      const results = {
        created: 0,
        updated: 0,
        failed: 0,
        errors: [] as string[],
      };

      // Process each product
      for (const product of products) {
        try {
          // Get stock from warehouse-microservice
          const stockQuantity = await this.warehouseClient.getTotalAvailable(product.id);

          // Check if ad already exists
          const existingAd = await this.prisma.bazosAd.findFirst({
            where: {
              accountId,
              productId: product.id,
            },
          });

          // Get pricing from catalog
          const pricing = await this.catalogClient.getProductPricing(product.id);
          const price = pricing?.basePrice || 0;

          if (existingAd) {
            // Update existing ad
            await this.prisma.bazosAd.update({
              where: { id: existingAd.id },
              data: {
                title: product.title || product.name,
                description: product.description,
                price: price,
                stockQuantity: stockQuantity,
                isActive: stockQuantity > 0,
                updatedAt: new Date(),
              },
            });
            results.updated++;
          } else {
            // Create new ad
            await this.prisma.bazosAd.create({
              data: {
                accountId,
                productId: product.id,
                title: product.title || product.name,
                description: product.description,
                price: price,
                stockQuantity: stockQuantity,
                isActive: stockQuantity > 0,
                // Set expiration to 30 days from now
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });
            results.created++;
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Product ${product.id}: ${error.message}`);
          this.logger.error(`Failed to sync product ${product.id}: ${error.message}`, error.stack);
        }
      }

      this.logger.log('Sync from catalog completed', results);
      return {
        success: true,
        ...results,
        total: products.length,
      };
    } catch (error: any) {
      this.logger.error(`Failed to sync from catalog: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Renew Bazos ad (extend expiration)
   */
  async renewAd(id: string, days: number = 30) {
    try {
      const ad = await this.prisma.bazosAd.findUnique({
        where: { id },
      });

      if (!ad) {
        throw new Error(`Ad ${id} not found`);
      }

      const newExpiration = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const updated = await this.prisma.bazosAd.update({
        where: { id },
        data: {
          expiresAt: newExpiration,
          isActive: true,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Ad ${id} renewed until ${newExpiration.toISOString()}`);
      return updated;
    } catch (error: any) {
      this.logger.error(`Failed to renew ad ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}

