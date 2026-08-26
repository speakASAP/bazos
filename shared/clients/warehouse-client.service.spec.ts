process.env.LOGGING_SERVICE_URL = process.env.LOGGING_SERVICE_URL || 'http://logging.test';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { WarehouseClientService } from './warehouse-client.service';

function makeLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;
}

describe('WarehouseClientService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.WAREHOUSE_SERVICE_URL;
    delete process.env.WAREHOUSE_SERVICE_TOKEN;
    delete process.env.SERVICE_TOKEN;
    // Must be cleared too: JWT_TOKEN holds the shared docs-rag credential, which
    // warehouse rejects. It must never be used as a fallback for the warehouse token.
    delete process.env.JWT_TOKEN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('requestOptions via getStockByProduct', () => {
    it('throws instead of sending an unauthenticated request when no token is configured', async () => {
      process.env.WAREHOUSE_SERVICE_URL = 'http://warehouse.test';
      const httpService = { get: jest.fn() } as any;
      const logger = makeLogger();
      const service = new WarehouseClientService(httpService, logger);

      await expect(service.getStockByProduct('product-1')).rejects.toThrow(
        'WAREHOUSE_SERVICE_AUTH_TOKEN_MISSING',
      );
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('does not fall back to JWT_TOKEN (shared docs-rag credential) for warehouse auth', async () => {
      process.env.WAREHOUSE_SERVICE_URL = 'http://warehouse.test';
      process.env.JWT_TOKEN = 'shared-docs-rag-token';
      const httpService = { get: jest.fn() } as any;
      const service = new WarehouseClientService(httpService, makeLogger());

      await expect(service.getStockByProduct('product-1')).rejects.toThrow(
        'WAREHOUSE_SERVICE_AUTH_TOKEN_MISSING',
      );
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('sends a Bearer Authorization header built from WAREHOUSE_SERVICE_TOKEN', async () => {
      process.env.WAREHOUSE_SERVICE_URL = 'http://warehouse.test';
      process.env.WAREHOUSE_SERVICE_TOKEN = 'warehouse-token';
      const httpService = {
        get: jest.fn().mockReturnValue(of({ data: { data: [{ warehouseId: 'w1', quantity: 5 }] } })),
      } as any;
      const service = new WarehouseClientService(httpService, makeLogger());

      await service.getStockByProduct('product-1');

      expect(httpService.get).toHaveBeenCalledWith(
        'http://warehouse.test/api/stock/product-1',
        { headers: { Authorization: 'Bearer warehouse-token' } },
      );
    });
  });

  describe('getStockByProduct', () => {
    it('returns [] on a 404 (no stock record)', async () => {
      process.env.WAREHOUSE_SERVICE_URL = 'http://warehouse.test';
      process.env.WAREHOUSE_SERVICE_TOKEN = 'warehouse-token';
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('Not Found');
            err.response = { status: HttpStatus.NOT_FOUND };
            return err;
          }),
        ),
      } as any;
      const service = new WarehouseClientService(httpService, makeLogger());

      await expect(service.getStockByProduct('product-missing')).resolves.toEqual([]);
    });

    it('THROWS on a 401 instead of masking it as empty stock', async () => {
      process.env.WAREHOUSE_SERVICE_URL = 'http://warehouse.test';
      process.env.WAREHOUSE_SERVICE_TOKEN = 'warehouse-token';
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
      const service = new WarehouseClientService(httpService, logger);

      await expect(service.getStockByProduct('product-1')).rejects.toBeInstanceOf(HttpException);
      await expect(service.getStockByProduct('product-1')).rejects.toThrow(
        'Stock lookup failed: Invalid token',
      );
      expect(logger.error).toHaveBeenCalled();
      const [message] = logger.error.mock.calls[0];
      expect(message).toContain('productId=product-1');
      expect(message).toContain('httpStatus=401');
    });

    it('throws on a 500 from warehouse', async () => {
      process.env.WAREHOUSE_SERVICE_URL = 'http://warehouse.test';
      process.env.WAREHOUSE_SERVICE_TOKEN = 'warehouse-token';
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('boom');
            err.response = { status: HttpStatus.INTERNAL_SERVER_ERROR };
            return err;
          }),
        ),
      } as any;
      const service = new WarehouseClientService(httpService, makeLogger());

      await expect(service.getStockByProduct('product-1')).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('getTotalAvailable', () => {
    it('returns 0 on a 404 (no stock record)', async () => {
      process.env.WAREHOUSE_SERVICE_URL = 'http://warehouse.test';
      process.env.WAREHOUSE_SERVICE_TOKEN = 'warehouse-token';
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('Not Found');
            err.response = { status: HttpStatus.NOT_FOUND };
            return err;
          }),
        ),
      } as any;
      const service = new WarehouseClientService(httpService, makeLogger());

      await expect(service.getTotalAvailable('product-missing')).resolves.toBe(0);
    });

    it('THROWS on a 401 instead of masking it as zero stock', async () => {
      process.env.WAREHOUSE_SERVICE_URL = 'http://warehouse.test';
      process.env.WAREHOUSE_SERVICE_TOKEN = 'warehouse-token';
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
      const service = new WarehouseClientService(httpService, logger);

      await expect(service.getTotalAvailable('product-1')).rejects.toBeInstanceOf(HttpException);
      await expect(service.getTotalAvailable('product-1')).rejects.toThrow(
        'Total stock lookup failed: Invalid token',
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
