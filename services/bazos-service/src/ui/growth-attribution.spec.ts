import { buildAuthRedirectEnvelope, pickGsid } from './growth-attribution';

/**
 * EP-005 W4 — the click half of the registration join (C-005 §2.2a).
 *
 * `bazos-service` emits `growth.auth_redirect.initiated.v1` at the moment the visitor clicks
 * through to auth, carrying the `state` it already mints as the join key. `auth-microservice`
 * round-trips that value and emits it back as `payload.correlationId`; growth-core joins the two.
 */

describe('pickGsid — cookie first, query second (C-005 §4)', () => {
  it('prefers the cookie', () => {
    expect(pickGsid('gsid=from-cookie; other=x', 'from-query')).toEqual({
      gsid: 'from-cookie',
      gsidSource: 'cookie',
    });
  });

  it('falls back to the query when there is no cookie', () => {
    expect(pickGsid('other=x', 'from-query')).toEqual({
      gsid: 'from-query',
      gsidSource: 'query',
    });
  });

  it('finds the cookie regardless of position or spacing', () => {
    expect(pickGsid('a=1;gsid=v;b=2', undefined)?.gsid).toBe('v');
    expect(pickGsid('a=1; gsid=v', undefined)?.gsid).toBe('v');
  });

  it('does not mistake a cookie whose name merely ends in gsid', () => {
    // `notgsid=` contains "gsid=" as a substring; a naive indexOf would read the wrong value and
    // silently attribute the visit to a token nobody minted.
    expect(pickGsid('notgsid=wrong', undefined)).toBeUndefined();
    expect(pickGsid('notgsid=wrong; gsid=right', undefined)?.gsid).toBe('right');
  });

  it('returns nothing when there is no gsid anywhere', () => {
    // Consent refused, cookie cleared, or a direct visit. An expected path, not an error
    // (C-005 §4) — the click is still recorded, it simply has no touchpoint to attribute to.
    expect(pickGsid('other=x', undefined)).toBeUndefined();
    expect(pickGsid('', undefined)).toBeUndefined();
    expect(pickGsid(undefined, undefined)).toBeUndefined();
  });

  it('ignores an empty gsid rather than emitting a blank one', () => {
    expect(pickGsid('gsid=', undefined)).toBeUndefined();
    expect(pickGsid('gsid=   ', undefined)).toBeUndefined();
  });

  it('url-decodes the cookie value', () => {
    expect(pickGsid('gsid=abc%2Edef', undefined)?.gsid).toBe('abc.def');
  });
});

describe('buildAuthRedirectEnvelope', () => {
  const args = {
    state: 'state-abc',
    gsid: 'sess.sig',
    gsidSource: 'cookie' as const,
    now: new Date('2026-07-21T10:00:00.000Z'),
    eventId: '11111111-2222-4333-8444-555555555555',
  };

  it('builds the envelope the contract pins', () => {
    expect(buildAuthRedirectEnvelope(args)).toEqual({
      eventId: '11111111-2222-4333-8444-555555555555',
      eventType: 'growth.auth_redirect.initiated.v1',
      eventVersion: 1,
      occurredAt: '2026-07-21T10:00:00.000Z',
      producer: 'bazos-service',
      workspaceId: 'bazos',
      correlationId: 'state-abc',
      dataClass: 'anonymous',
      payload: {
        correlationId: 'state-abc',
        gsid: 'sess.sig',
        gsidSource: 'cookie',
        initiatedAt: '2026-07-21T10:00:00.000Z',
      },
    });
  });

  it('uses the caller state as the correlationId, not a freshly minted one', () => {
    // `state` is already bazos's CSRF token: createState() mints it per attempt and the callback
    // checks it. Minting a second handle here would either break that check or leave auth
    // echoing back a value growth never saw. One handle, two jobs.
    const envelope = buildAuthRedirectEnvelope({ ...args, state: 'the-csrf-state' });
    expect(envelope.correlationId).toBe('the-csrf-state');
    expect(envelope.payload.correlationId).toBe('the-csrf-state');
  });

  it('omits gsid entirely when there is none', () => {
    const envelope = buildAuthRedirectEnvelope({ ...args, gsid: undefined, gsidSource: undefined });
    expect(envelope.payload).not.toHaveProperty('gsid');
    expect(envelope.payload).not.toHaveProperty('gsidSource');
    expect(envelope.payload.correlationId).toBe('state-abc');
  });

  it('carries no growth-core-only fields the schema forbids', () => {
    // The schema is additionalProperties:false. An extra key means growth-core answers 400 and
    // the click is dropped — a silent hole in attribution rather than a loud failure.
    expect(Object.keys(buildAuthRedirectEnvelope(args).payload).sort()).toEqual(
      ['correlationId', 'gsid', 'gsidSource', 'initiatedAt'].sort(),
    );
  });

  it('refuses to build without a state, rather than emitting an unjoinable click', () => {
    expect(() => buildAuthRedirectEnvelope({ ...args, state: '' })).toThrow(/state/i);
    expect(() => buildAuthRedirectEnvelope({ ...args, state: '   ' })).toThrow(/state/i);
  });
});
