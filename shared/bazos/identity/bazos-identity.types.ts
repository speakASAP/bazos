/**
 * Domain types for Bazos verified phone identities.
 * These are the allowed status/review/session values; never add a bypass state here.
 */

export const IDENTITY_STATUS = {
  DRAFT: 'draft',
  VERIFIED: 'verified',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;
export type IdentityStatus = typeof IDENTITY_STATUS[keyof typeof IDENTITY_STATUS];

export const REVIEW_STATE = {
  CLEAR: 'clear',
  VERIFICATION_REQUIRED: 'verification_required',
  BANK_VERIFICATION_REQUIRED: 'bank_verification_required',
  CAPTCHA_OR_HUMAN_CHECK_REQUIRED: 'captcha_or_human_check_required',
  SESSION_EXPIRED: 'session_expired',
  BLOCKED_BY_BAZOS: 'blocked_by_bazos',
  DUPLICATE_REJECTED: 'duplicate_rejected',
  CONTENT_POLICY_REJECTED: 'content_policy_rejected',
  CATEGORY_REVIEW_REQUIRED: 'category_review_required',
} as const;
export type ReviewState = typeof REVIEW_STATE[keyof typeof REVIEW_STATE];

export const SESSION_STATE = {
  MISSING: 'missing',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CHALLENGE: 'challenge',
} as const;
export type SessionState = typeof SESSION_STATE[keyof typeof SESSION_STATE];

export const MAX_ACTIVE_ADS = 50;
export const PACING_MIN_SECONDS = 60;
export const PACING_MAX_SECONDS = 180;
export const CATEGORY_COOLDOWN_HOURS = 24;
