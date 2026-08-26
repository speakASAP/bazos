process.env.LOGGING_SERVICE_URL = process.env.LOGGING_SERVICE_URL || 'http://logging.test';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CatalogClientService } from './catalog-client.service';

function makeLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;
}

describe('CatalogClientService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.CATALOG_SERVICE_URL = 'http://catalog.test';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getProductBySku', () => {
    it('returns null on a 404 (no such SKU)', async () => {
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('Not Found');
            err.response = { status: HttpStatus.NOT_FOUND };
            return err;
          }),
        ),
      } as any;
      const service = new CatalogClientService(httpService, makeLogger());

      await expect(service.getProductBySku('missing-sku')).resolves.toBeNull();
    });

    it('THROWS on a 401 instead of masking it as an unknown SKU', async () => {
      const logger = makeLogger();
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('Invalid token');
            err.response = { status: HttpStatus.UNAUTHORIZED };
            return err;
          }),
        ),
      } as any;
      const service = new CatalogClientService(httpService, logger);

      await expect(service.getProductBySku('sku-1')).rejects.toBeInstanceOf(HttpException);
      await expect(service.getProductBySku('sku-1')).rejects.toThrow(
        'Product lookup by SKU failed: Invalid token',
      );
      expect(logger.error).toHaveBeenCalled();
      const [message] = logger.error.mock.calls[0];
      expect(message).toContain('sku=sku-1');
      expect(message).toContain('httpStatus=401');
    });
  });

  describe('searchProducts', () => {
    it('THROWS on a 401 instead of masking it as zero matching products', async () => {
      // This is the duplicate-ad-prevention search path
      // (BazosAdService.findSimilarCatalogProduct): a false "no matches" here
      // creates a duplicate catalog product instead of reusing the existing one.
      const logger = makeLogger();
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('Invalid token');
            err.response = { status: HttpStatus.UNAUTHORIZED };
            return err;
          }),
        ),
      } as any;
      const service = new CatalogClientService(httpService, logger);

      await expect(service.searchProducts({ search: 'title', limit: 10 })).rejects.toBeInstanceOf(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });

    it('THROWS on a 500 from catalog', async () => {
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('boom');
            err.response = { status: HttpStatus.INTERNAL_SERVER_ERROR };
            return err;
          }),
        ),
      } as any;
      const service = new CatalogClientService(httpService, makeLogger());

      await expect(service.searchProducts({ limit: 10 })).rejects.toBeInstanceOf(HttpException);
    });

    it('still returns the items shape on success', async () => {
      const httpService = {
        get: jest.fn().mockReturnValue(of({ data: { data: [{ id: 'p1' }], pagination: { total: 1, page: 1, limit: 20 } } })),
      } as any;
      const service = new CatalogClientService(httpService, makeLogger());

      await expect(service.searchProducts({ limit: 20 })).resolves.toEqual({
        items: [{ id: 'p1' }],
        total: 1,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('getProductPricing', () => {
    it('returns null on a 404 (no pricing record)', async () => {
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('Not Found');
            err.response = { status: HttpStatus.NOT_FOUND };
            return err;
          }),
        ),
      } as any;
      const service = new CatalogClientService(httpService, makeLogger());

      await expect(service.getProductPricing('product-missing')).resolves.toBeNull();
    });

    it('THROWS on a 401 instead of masking it as missing pricing (which OffersService.syncFromCatalog would write as price: 0)', async () => {
      const logger = makeLogger();
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('Invalid token');
            err.response = { status: HttpStatus.UNAUTHORIZED };
            return err;
          }),
        ),
      } as any;
      const service = new CatalogClientService(httpService, logger);

      await expect(service.getProductPricing('product-1')).rejects.toBeInstanceOf(HttpException);
      await expect(service.getProductPricing('product-1')).rejects.toThrow(
        'Pricing lookup failed: Invalid token',
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
