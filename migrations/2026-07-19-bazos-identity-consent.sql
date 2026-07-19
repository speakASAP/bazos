-- Seller consent for Alfares to publish under a verified Bazos identity.
-- Publishing is gated on a live, current-version row here (POLICY_GATE.CONSENT_MISSING).
--
-- Existing identities intentionally get NO backfilled consent: consent cannot be
-- granted retroactively on the seller's behalf. Every identity must re-accept, and
-- publishing stays blocked until they do.

CREATE TABLE IF NOT EXISTS bazos_identity_consents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "identityId"     UUID NOT NULL REFERENCES bazos_identities(id) ON DELETE CASCADE,
  "userId"         VARCHAR(100) NOT NULL,
  scope            VARCHAR(50) NOT NULL DEFAULT 'publish',
  "documentVersion" VARCHAR(100) NOT NULL,
  "grantedAt"      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  "revokedAt"      TIMESTAMP(6),
  ip               VARCHAR(100),
  "userAgent"      TEXT,
  "createdAt"      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bazos_identity_consents_lookup_idx
  ON bazos_identity_consents ("identityId", scope, "revokedAt");

CREATE INDEX IF NOT EXISTS bazos_identity_consents_user_idx
  ON bazos_identity_consents ("userId");
