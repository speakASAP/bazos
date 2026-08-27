process.env.LOGGING_SERVICE_URL = process.env.LOGGING_SERVICE_URL || 'http://logging.test';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OrderClientService } from './order-client.service';

function makeLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;
}

describe('OrderClientService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.ORDER_SERVICE_URL;
    delete process.env.ORDER_SERVICE_NAME;
    delete process.env.SERVICE_NAME;
    delete process.env.BAZOS_INTERNAL_SERVICE_TOKEN;
    delete process.env.ORDERS_INTERNAL_SERVICE_TOKEN;
    delete process.env.ORDER_SERVICE_INTERNAL_TOKEN;
    delete process.env.JWT_TOKEN;
    delete process.env.SERVICE_TOKEN;
    // Must be cleared too: it takes precedence over every static token above, so
    // leaving it set would make the fallback cases silently exercise the Bearer path.
    delete process.env.ORDERS_SERVICE_TOKEN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('sends canonical create payload with Bazos internal service headers', async () => {
    process.env.ORDER_SERVICE_URL = 'http://orders.test';
    process.env.ORDERS_SERVICE_TOKEN = 'test-bearer-token';
    const httpService = {
      post: jest.fn().mockReturnValue(of({ data: { data: { id: 'central-order-1' } } })),
    } as any;
    const service = new OrderClientService(httpService, makeLogger());

    await service.createOrder({
      externalOrderId: 'bazos-order-1',
      channel: 'bazos',
      items: [{
        productId: 'catalog-product-1',
        warehouseId: 'warehouse-1',
        title: 'Bazos item',
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100,
      }],
      subtotal: 100,
      shippingCost: 0,
      taxAmount: 0,
      total: 100,
      currency: 'CZK',
    });

    expect(httpService.post).toHaveBeenCalledWith(
      'http://orders.test/api/orders',
      expect.objectContaining({
        contractVersion: 'orders.create.v1',
        channel: 'bazos',
        channelAccountId: 'default',
        items: [expect.objectContaining({
          productId: 'catalog-product-1',
          warehouseId: 'warehouse-1',
        })],
      }),
      {
        headers: {
          'x-service-name': 'bazos-service',
          Authorization: 'Bearer test-bearer-token',
        },
      },
    );
  });
  it('reads central order lifecycle status from Orders detail', async () => {
    process.env.ORDER_SERVICE_URL = 'http://orders.test';
    process.env.ORDERS_SERVICE_TOKEN = 'test-bearer-token';
    const httpService = {
      get: jest.fn().mockReturnValue(of({
        data: {
          data: {
            id: 'central-order-1',
            status: 'processing',
            paymentStatus: 'paid',
            warehouseHandoff: { status: 'reserved' },
            items: [{ fulfillmentStatus: 'reserved' }],
            updatedAt: '2026-07-02T10:00:00.000Z',
          },
        },
      })),
    } as any;
    const service = new OrderClientService(httpService, makeLogger());

    const result = await service.getOrderLifecycleStatus('central-order-1');

    expect(httpService.get).toHaveBeenCalledWith(
      'http://orders.test/api/orders/central-order-1',
      {
        headers: {
          'x-service-name': 'bazos-service',
          Authorization: 'Bearer test-bearer-token',
        },
      },
    );
    expect(result).toEqual(expect.objectContaining({
      orderId: 'central-order-1',
      status: 'processing',
      lifecycleStage: 'warehouse_collecting',
      paymentStatus: 'paid',
      fulfillmentStatus: 'collecting',
      source: 'orders.detail',
    }));
  });

  // Inverted on 2026-08-27. This used to assert that an unset ORDERS_SERVICE_TOKEN
  // fell back to JWT_TOKEN as an x-internal-service-token header. That property
  // holds a2880693, the value shared with five other services, and
  // orders-microservice stopped accepting it from any caller when header-chosen
  // identity was closed — so the fallback could only ever produce a 401 that
  // looked like an orders-side fault. It must now fail loudly instead.
  it('throws rather than falling back to a static header when ORDERS_SERVICE_TOKEN is unset', async () => {
    process.env.ORDER_SERVICE_URL = 'http://orders.test';
    process.env.JWT_TOKEN = 'runtime-service-token';
    process.env.BAZOS_INTERNAL_SERVICE_TOKEN = 'test-internal-token';
    const httpService = {
      post: jest.fn().mockReturnValue(of({ data: { data: { id: 'central-order-1' } } })),
    } as any;
    const service = new OrderClientService(httpService, makeLogger());

    await expect(service.createOrder({
      externalOrderId: 'bazos-order-2',
      channel: 'bazos',
      items: [{
        productId: 'catalog-product-1',
        warehouseId: 'warehouse-1',
        title: 'Bazos item',
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100,
      }],
      subtotal: 100,
      shippingCost: 0,
      taxAmount: 0,
      total: 100,
      currency: 'CZK',
    })).rejects.toThrow(/orders-microservice runtime credential/);

    // and no unauthenticated request may be sent
    expect(httpService.post).not.toHaveBeenCalled();
  });

  it('prefers the per-pair RS256 principal as a Bearer token over every static token', async () => {
    process.env.ORDER_SERVICE_URL = 'http://orders.test';
    process.env.ORDERS_SERVICE_TOKEN = 'test-bearer-token';
    // Set deliberately: the Bearer path must win, and the shared static header must
    // not be sent alongside it — otherwise orders still derives identity from
    // x-service-name rather than verifying the token.
    process.env.ORDERS_SERVICE_TOKEN = 'test-bearer-token';
    const httpService = {
      post: jest.fn().mockReturnValue(of({ data: { data: { id: 'central-order-1' } } })),
    } as any;
    const service = new OrderClientService(httpService, makeLogger());

    await service.createOrder({
      externalOrderId: 'bazos-order-3',
      channel: 'bazos',
      items: [{
        productId: 'catalog-product-1',
        warehouseId: 'warehouse-1',
        title: 'Bazos item',
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100,
      }],
      subtotal: 100,
      shippingCost: 0,
      taxAmount: 0,
      total: 100,
      currency: 'CZK',
    });

    const options = httpService.post.mock.calls[0][2];
    expect(options.headers.Authorization).toBe('Bearer test-bearer-token');
    expect(options.headers['x-internal-service-token']).toBeUndefined();
    expect(options.headers['x-service-name']).toBe('bazos-service');
  });

  describe('findByExternalId', () => {
    it('returns null on a 404 (no matching order)', async () => {
      process.env.ORDER_SERVICE_URL = 'http://orders.test';
      process.env.ORDERS_SERVICE_TOKEN = 'test-bearer-token';
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('Not Found');
            err.response = { status: HttpStatus.NOT_FOUND };
            return err;
          }),
        ),
      } as any;
      const service = new OrderClientService(httpService, makeLogger());

      await expect(service.findByExternalId('bazos-order-1', 'bazos')).resolves.toBeNull();
    });

    it('THROWS on a 401 instead of masking it as "no matching order yet" (which would create a duplicate order)', async () => {
      process.env.ORDER_SERVICE_URL = 'http://orders.test';
      process.env.ORDERS_SERVICE_TOKEN = 'test-bearer-token';
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
      const service = new OrderClientService(httpService, logger);

      await expect(service.findByExternalId('bazos-order-1', 'bazos')).rejects.toBeInstanceOf(HttpException);
      await expect(service.findByExternalId('bazos-order-1', 'bazos')).rejects.toThrow(
        'Failed to look up order by external id: Invalid token',
      );
      expect(logger.error).toHaveBeenCalled();
      const [message] = logger.error.mock.calls[0];
      expect(message).toContain('externalOrderId=bazos-order-1');
      expect(message).toContain('httpStatus=401');
    });

    it('THROWS on a 500 from orders-microservice', async () => {
      process.env.ORDER_SERVICE_URL = 'http://orders.test';
      process.env.ORDERS_SERVICE_TOKEN = 'test-bearer-token';
      const httpService = {
        get: jest.fn().mockReturnValue(
          throwError(() => {
            const err: any = new Error('boom');
            err.response = { status: HttpStatus.INTERNAL_SERVER_ERROR };
            return err;
          }),
        ),
      } as any;
      const service = new OrderClientService(httpService, makeLogger());

      await expect(service.findByExternalId('bazos-order-1', 'bazos')).rejects.toBeInstanceOf(HttpException);
    });

    it('still finds the matching order on success', async () => {
      process.env.ORDER_SERVICE_URL = 'http://orders.test';
      process.env.ORDERS_SERVICE_TOKEN = 'test-bearer-token';
      const httpService = {
        get: jest.fn().mockReturnValue(of({ data: { data: [{ externalOrderId: 'bazos-order-1', id: 'central-1' }] } })),
      } as any;
      const service = new OrderClientService(httpService, makeLogger());

      await expect(service.findByExternalId('bazos-order-1', 'bazos')).resolves.toEqual(
        expect.objectContaining({ id: 'central-1' }),
      );
    });
  });

});
