/**
 * EP-005 W4 — the click half of the registration join (C-005 §2.2a).
 *
 * When a visitor clicks through to the hosted auth flow, `bazos-service` records that the click
 * happened and which anonymous session it came from. `auth-microservice` records the registration
 * that may follow; `growth-core` joins the two on `correlationId`.
 *
 * **The join key is the `state` bazos already mints.** `createState()` produces a unique opaque
 * handle per attempt for CSRF, and auth round-trips it untouched. Minting a second handle here
 * would either fight the CSRF check or leave auth echoing a value growth never saw.
 *
 * **`gsid` never leaves this host.** It is read from the cookie server-side and sent straight to
 * growth-core; only `correlationId` travels through `auth.alfares.cz`, which keeps the attribution
 * token out of auth's access logs and any `Referer` header (D-005 §3).
 *
 * Pure on purpose — everything here is decided without I/O, so the parts that are easy to get
 * quietly wrong are the parts that are cheap to test.
 */

export const AUTH_REDIRECT_EVENT = 'growth.auth_redirect.initiated.v1';

/** One business, one workspace. `workspaceId`, never `tenantId` — that is Marketing's legacy field. */
export const GROWTH_WORKSPACE_ID = 'bazos';

export type GsidSource = 'cookie' | 'query';

export interface GsidPick {
  gsid: string;
  gsidSource: GsidSource;
}

/**
 * Cookie first, query second (C-005 §4).
 *
 * The cookie is the store: it carries `gsid` across navigation within `bazos.alfares.cz` so the
 * value survives until the visitor clicks through. The query parameter is the fallback for a
 * first landing that has not set the cookie yet.
 *
 * Returns nothing when there is no usable value — consent refused, cookie cleared, or a direct
 * visit. That is the contract's expected path, not an error: the click is still recorded, it
 * simply has no touchpoint to attribute to.
 */
export function pickGsid(cookieHeader?: string, queryGsid?: string): GsidPick | undefined {
  const fromCookie = readCookie(cookieHeader, 'gsid');
  if (fromCookie) return { gsid: fromCookie, gsidSource: 'cookie' };

  const fromQuery = queryGsid?.trim();
  if (fromQuery) return { gsid: fromQuery, gsidSource: 'query' };

  return undefined;
}

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    // Compare the whole name, not a substring: `notgsid=` contains `gsid=`, and matching it
    // would attribute the visit to a token nobody minted.
    if (part.slice(0, separator).trim() !== name) continue;

    const raw = part.slice(separator + 1).trim();
    if (!raw) return undefined;
    try {
      return decodeURIComponent(raw) || undefined;
    } catch {
      // A malformed percent-escape is not worth failing a registration over.
      return raw;
    }
  }
  return undefined;
}

export interface AuthRedirectEnvelope {
  eventId: string;
  eventType: typeof AUTH_REDIRECT_EVENT;
  eventVersion: 1;
  occurredAt: string;
  producer: 'bazos-service';
  workspaceId: string;
  correlationId: string;
  dataClass: 'anonymous';
  payload: {
    correlationId: string;
    gsid?: string;
    gsidSource?: GsidSource;
    initiatedAt: string;
  };
}

export interface AuthRedirectInput {
  state: string;
  gsid?: string;
  gsidSource?: GsidSource;
  now: Date;
  eventId: string;
}

export function buildAuthRedirectEnvelope(input: AuthRedirectInput): AuthRedirectEnvelope {
  const correlationId = input.state?.trim();
  if (!correlationId) {
    // Without the join key the click can never be matched to its registration. Better to fail
    // here, where it is visible, than to emit an event that quietly counts for nothing.
    throw new Error('cannot emit growth.auth_redirect.initiated.v1 without a state');
  }

  const occurredAt = input.now.toISOString();
  const payload: AuthRedirectEnvelope['payload'] = {
    correlationId,
    initiatedAt: occurredAt,
  };
  // Absent, not null: the schema is additionalProperties:false and types these as strings, so a
  // null would be rejected by growth-core and the click dropped.
  if (input.gsid) {
    payload.gsid = input.gsid;
    if (input.gsidSource) payload.gsidSource = input.gsidSource;
  }

  return {
    eventId: input.eventId,
    eventType: AUTH_REDIRECT_EVENT,
    eventVersion: 1,
    occurredAt,
    producer: 'bazos-service',
    workspaceId: GROWTH_WORKSPACE_ID,
    correlationId,
    dataClass: 'anonymous',
    payload,
  };
}
