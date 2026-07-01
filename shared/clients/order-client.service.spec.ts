process.env.LOGGING_SERVICE_URL = process.env.LOGGING_SERVICE_URL || 'http://logging.test';
import { of } from 'rxjs';
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
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('sends canonical create payload with Bazos internal service headers', async () => {
    process.env.ORDER_SERVICE_URL = 'http://orders.test';
    process.env.BAZOS_INTERNAL_SERVICE_TOKEN = 'test-internal-token';
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
          'x-internal-service-token': 'test-internal-token',
        },
      },
    );
  });
});
