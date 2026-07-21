import { GrowthAttributionService } from './growth-attribution.service';

/**
 * Sending the click to growth-core. The one property that matters more than delivery: a visitor
 * clicking "register" must never wait on, or be blocked by, an analytics call.
 */
const logger = () => ({ log: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() });

describe('GrowthAttributionService', () => {
  const previousUrl = process.env.GROWTH_CORE_URL;
  afterEach(() => {
    if (previousUrl === undefined) delete process.env.GROWTH_CORE_URL;
    else process.env.GROWTH_CORE_URL = previousUrl;
  });

  it('posts a bare array of envelopes, which is what the endpoint accepts', async () => {
    // POST /ingest/events takes an array (or one envelope object), never a {"events": [...]}
    // wrapper — that shape answers 400 and the click is lost.
    const post = jest.fn(async (_url: string, _body: unknown) => ({ status: 202 }));
    const service = new GrowthAttributionService(logger() as never, post);

    await service.recordAuthRedirect({ state: 'state-1', cookieHeader: 'gsid=abc' });

    expect(post).toHaveBeenCalledTimes(1);
    const [url, body] = post.mock.calls[0] as [string, unknown[]];
    expect(url).toContain('/ingest/events');
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect((body[0] as { eventType: string }).eventType).toBe('growth.auth_redirect.initiated.v1');
  });

  it('carries the gsid from the cookie without it ever reaching auth', async () => {
    const post = jest.fn(async (_url: string, _body: unknown) => ({ status: 202 }));
    const service = new GrowthAttributionService(logger() as never, post);

    await service.recordAuthRedirect({ state: 'state-1', cookieHeader: 'gsid=sess.sig' });

    const payload = (post.mock.calls[0][1] as Array<{ payload: Record<string, unknown> }>)[0].payload;
    expect(payload.gsid).toBe('sess.sig');
    expect(payload.gsidSource).toBe('cookie');
    expect(payload.correlationId).toBe('state-1');
  });

  it('still records the click when there is no gsid', async () => {
    // Consent refused or a direct visit. The registration must proceed and be counted; only the
    // ad attribution is missing (C-005 §4).
    const post = jest.fn(async (_url: string, _body: unknown) => ({ status: 202 }));
    const service = new GrowthAttributionService(logger() as never, post);

    await service.recordAuthRedirect({ state: 'state-1', cookieHeader: '' });

    const payload = (post.mock.calls[0][1] as Array<{ payload: Record<string, unknown> }>)[0].payload;
    expect(payload).not.toHaveProperty('gsid');
    expect(payload.correlationId).toBe('state-1');
  });

  it('does not throw when growth-core is unreachable', async () => {
    // The caller is about to redirect the visitor to registration. An attribution outage must not
    // become a registration outage.
    const post = jest.fn(async (_url: string, _body: unknown): Promise<{ status: number }> => {
      throw new Error('ECONNREFUSED');
    });
    const service = new GrowthAttributionService(logger() as never, post);

    await expect(
      service.recordAuthRedirect({ state: 'state-1', cookieHeader: 'gsid=abc' }),
    ).resolves.toBeUndefined();
  });

  it('does not throw when growth-core rejects the envelope', async () => {
    const post = jest.fn(async (_url: string, _body: unknown) => ({ status: 400 }));
    const log = logger();
    const service = new GrowthAttributionService(log as never, post);

    await expect(
      service.recordAuthRedirect({ state: 'state-1', cookieHeader: 'gsid=abc' }),
    ).resolves.toBeUndefined();
    expect(log.warn).toHaveBeenCalled();
  });

  it('does not throw when there is no state to join on', async () => {
    const post = jest.fn(async (_url: string, _body: unknown) => ({ status: 202 }));
    const service = new GrowthAttributionService(logger() as never, post);

    await expect(service.recordAuthRedirect({ state: '', cookieHeader: '' })).resolves.toBeUndefined();
    expect(post).not.toHaveBeenCalled();
  });

  it('gives every click its own eventId', async () => {
    // The buffer dedups on eventId. Two genuine clicks sharing one id would collapse into a
    // single recorded click.
    const post = jest.fn(async (_url: string, _body: unknown) => ({ status: 202 }));
    const service = new GrowthAttributionService(logger() as never, post);

    await service.recordAuthRedirect({ state: 'state-1', cookieHeader: '' });
    await service.recordAuthRedirect({ state: 'state-2', cookieHeader: '' });

    const first = (post.mock.calls[0][1] as Array<{ eventId: string }>)[0].eventId;
    const second = (post.mock.calls[1][1] as Array<{ eventId: string }>)[0].eventId;
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
  });
});
