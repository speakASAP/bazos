/**
 * Types for publish policy gate evaluation results.
 */

export const POLICY_GATE = {
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
