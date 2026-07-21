import { Injectable, Logger, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { buildAuthRedirectEnvelope, pickGsid } from './growth-attribution';

const DEFAULT_GROWTH_CORE_URL = 'http://growth-core.statex-apps.svc.cluster.local:3376';

/** Short on purpose: the visitor is mid-click. Better a missed event than a stalled redirect. */
const TIMEOUT_MS = 1500;

export type PostJson = (url: string, body: unknown) => Promise<{ status: number }>;

const defaultPost: PostJson = async (url, body) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return { status: response.status };
  } finally {
    clearTimeout(timer);
  }
};

export interface AuthRedirectRecord {
  state: string;
  cookieHeader?: string;
  queryGsid?: string;
}

/**
 * Records that a visitor clicked through to the hosted auth flow (EP-005 W4, C-005 §2.2a).
 *
 * Emitted **at the click, before navigation** — never on the return callback. A visitor who
 * registers and closes the tab has registered, and an event that depends on them coming back
 * would miss exactly the conversions worth counting.
 *
 * Nothing here can fail a redirect. Every path resolves: an attribution outage is a gap in a
 * report, while a blocked redirect is a person who could not sign up.
 */
@Injectable()
export class GrowthAttributionService {
  constructor(
    @Optional() private readonly logger: Logger = new Logger(GrowthAttributionService.name),
    // A seam for the specs, not a provider.
    @Optional() private readonly post: PostJson = defaultPost,
  ) {}

  async recordAuthRedirect(record: AuthRedirectRecord): Promise<void> {
    try {
      const picked = pickGsid(record.cookieHeader, record.queryGsid);
      const envelope = buildAuthRedirectEnvelope({
        state: record.state,
        gsid: picked?.gsid,
        gsidSource: picked?.gsidSource,
        now: new Date(),
        eventId: randomUUID(),
      });

      const base = process.env.GROWTH_CORE_URL || DEFAULT_GROWTH_CORE_URL;
      // A bare array: POST /ingest/events takes envelopes directly, not a {"events": [...]}
      // wrapper, which it answers with 400.
      const { status } = await this.post(`${base}/ingest/events`, [envelope]);

      if (status >= 300) {
        // 400 means the envelope did not match the schema — a contract drift worth seeing, since
        // it silently costs every click until someone notices.
        this.logger.warn(
          `growth-core rejected the auth-redirect event (HTTP ${status}) for state ${record.state}`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `could not record the auth redirect for state ${record.state}: ${describe(err)}`,
      );
    }
  }
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
