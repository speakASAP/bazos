/**
 * Types for publish policy gate evaluation results.
 */

/**
 * Scopes a seller can consent to. Consent is never implied by account creation or
 * by identity verification — those establish who the seller is, not that Alfares
 * may act for them.
 */
export const CONSENT_SCOPE = {
  /** Alfares may prepare and publish Bazos ads under the seller's verified identity. */
  PUBLISH: 'publish',
} as const;
export type ConsentScope = typeof CONSENT_SCOPE[keyof typeof CONSENT_SCOPE];

/**
 * Version of the consent text the seller agreed to. Bump this whenever the wording
 * changes materially; stored consents on an older version stop satisfying the gate
 * and the seller is asked again.
 */
export const CONSENT_DOCUMENT_VERSION = 'bazos-publish-consent-v1';

export const POLICY_GATE = {
  CONSENT_MISSING: 'consent_missing',
  IDENTITY_NOT_VERIFIED: 'identity_not_verified',
  IDENTITY_REVIEW_BLOCKED: 'identity_review_blocked',
  IDENTITY_VERIFICATION_EXPIRED: 'identity_verification_expired',
  IDENTITY_SESSION_NOT_ACTIVE: 'identity_session_not_active',
  ACTIVE_AD_CAP_REACHED: 'active_ad_cap_reached',
  PACING_TOO_SOON: 'pacing_too_soon',
  CATEGORY_COOLDOWN: 'category_cooldown',
  LOCAL_DUPLICATE: 'local_duplicate',
  WAREHOUSE_STOCK_UNAVAILABLE: 'warehouse_stock_unavailable',
  CATALOG_QUALITY_BLOCKED: 'catalog_quality_blocked',
  CATALOG_BUNDLE_PUBLICATION_BLOCKED: 'catalog_bundle_publication_blocked',
  PUBLIC_DUPLICATE_CHECK_MISSING: 'public_duplicate_check_missing',
  PUBLIC_DUPLICATE: 'public_duplicate',
  CATEGORY_MISSING_OR_BLOCKED: 'category_missing_or_blocked',
  CONTENT_POLICY_NOT_VALIDATED: 'content_policy_not_validated',
  CONTENT_POLICY_FAIL: 'content_policy_fail',
} as const;
export type PolicyGate = typeof POLICY_GATE[keyof typeof POLICY_GATE];

export interface PolicyGateFailure {
  gate: PolicyGate;
  message: string;
  blockedUntil?: Date;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  failures: PolicyGateFailure[];
  /** Randomly selected pacing delay (seconds) for the next attempt, only set when allowed=true */
  selectedPacingDelaySeconds?: number;
  evaluatedAt: Date;
}
