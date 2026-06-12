# Plan: Compliant Bazos Publishing

## Goal 1 - Compliance Model And Guardrails

Implement the domain model and backend enforcement that makes Bazos limits impossible to bypass through normal APIs.

- [ ] Add verified Bazos identity storage with encrypted session/cookie data, phone number, seller defaults, verification status, expiry, and review/block state.
- [ ] Add publish policy service that evaluates active-ad cap, duplicate state, category cadence, identity status, and randomized per-identity pacing.
- [ ] Add audit records for publish attempts and challenge outcomes.
- [ ] Add unit tests for cap, timing, category, duplicate, and blocked identity behavior.

## Goal 2 - Human Verification Session Flow

Allow a user to connect a Bazos phone identity without automating around Bazos verification.

- [ ] Add an identity setup endpoint that starts a controlled browser session.
- [ ] Let the user complete SMS and bank/micro-payment verification manually.
- [ ] Store only the resulting allowed session state securely.
- [ ] Detect expiry/challenges and move identity back to manual review.

## Goal 3 - Publisher Queue

Publish drafts only through the policy service.

- [ ] Add local Bazos draft creation from catalog product data.
- [ ] Add POST /offers/:id/publish to enqueue a publish attempt.
- [ ] Serialize attempts per identity.
- [ ] Wait a random 60-180 seconds between identity attempts; never publish below 60 seconds.
- [ ] Stop on Bazos verification, CAPTCHA, duplicate, deletion, or policy challenge.
- [ ] Store Bazos ad ID and expiration after successful publish.

## Goal 4 - Catalog Sell Button

Add catalog-side integration after the guarded publisher exists.

- [ ] Add a product-level action that calls bazos-service to create a draft.
- [ ] Show selected Bazos identity, category mapping, active-ad count, and policy status.
- [ ] Require explicit user confirmation before queueing publish.
- [ ] Poll publish status and show failure reasons requiring human action.

## Goal 5 - Operations And Monitoring

Make compliance visible in production.

- [ ] Add logs and metrics for publish attempts, blocked attempts, policy gate failures, and challenge states.
- [ ] Add admin view for identities needing review.
- [ ] Add reconciliation job for active Bazos ad counts and expired ads.
- [ ] Add smoke tests that confirm blocked policy gates cannot publish.

## Separate Goals Required

Use RunLayer intent preservation for each implementation track:

1. Bazos identity/session/compliance backend.
2. Bazos human verification flow.
3. Bazos publisher queue and browser submitter.
4. Catalog microservice sell button and UX.
5. Monitoring/reconciliation.
