# Tasks: bazos-service

## Backlog
<!-- Human-managed -->

- Implement compliant Bazos identity/session model: verified phone identities, verification expiry, encrypted cookies, active-ad cap tracking, and human review state.
- Implement compliant publisher queue: duplicate checks, per-identity randomized 60-180 second pacing, 24h per-category gate, max 50 active ads per identity, and stop-on-challenge behavior.
- Add catalog integration goal separately: product-level Sell on Bazos action that creates a local draft and queues publish only through bazos-service guardrails.

## Active
<!-- Coordinator-maintained -->

## Completed
<!-- Coordinator-append-only -->
- 2026-07-01 goal-17-owner-approved-synthetic-orders-smoke: live Bazos pod created a synthetic Bazos channel order through Orders with accepted Bazos service headers; Warehouse handoff reserved one item, approved cleanup cancelled the order/reservation, and post-cleanup Warehouse read returned reserved=0. Remaining blocker: [UNKNOWN: live Bazos marketplace webhook support].
- 2026-07-01 goal-17-orders-runtime-deployment-verification: deployed Bazos Orders create readiness/runtime token fallback to image `localhost:5000/bazos-service:230c6b5`; health smoke passed; initial mutating Orders-create smoke was deferred before owner approval, and true live Bazos marketplace webhook support remains [UNKNOWN: live Bazos marketplace webhook support].
- 2026-07-01 goal-17-orders-token-runtime-follow-up: aligned Bazos Orders client with deployed Orders aliasing by adding caller-side `JWT_TOKEN` / `SERVICE_TOKEN` fallback; key names checked without printing secret values.
- 2026-07-01 goal-17-orders-canonical-create-readiness: added accepted Orders internal auth headers and fail-closed `warehouseId` guard for Bazos canonical create; kept true live Bazos webhook support `[UNKNOWN: live Bazos marketplace webhook support]`; the runtime credential/live smoke gate was later resolved by the owner-approved synthetic smoke follow-up.
- 2026-06-26 goal-17-bazos-order-forwarding-follow-up: added synthetic/internal Catalog product ID order payload support while keeping true live Bazos webhook support [UNKNOWN: live Bazos marketplace webhook support].
- 2026-06-26 goal-17-bazos-order-forwarding: blocked invalid empty-item central Orders forwarding, added BazosAd.productId item mapping when ad-line identifiers are present, and documented [MISSING: Bazos order item ingestion contract] for true webhook ingestion.
- 2026-04-05 documentation-standard-applied
- 2026-06-12 compliance-model: BazosIdentity service/controller, PublishPolicyService (8 gates), BazosAdService draft/challenge, unit tests
- 2026-06-12 goal-01-identity-session-compliance: completed IPS review and strengthened policy to fail closed on inactive sessions, missing/stale public duplicate evidence, missing/stale content-policy evidence, and all documented challenge states
- 2026-06-12 goal-02-human-verification-flow: added human verification session lifecycle, encrypted session envelope requirement, challenge/expiry stop states, and validation reports
- 2026-06-12 goal-03-publisher-queue: added guarded publish queue, idempotent enqueue, persisted 60-180s pacing reservation, claim-time policy re-check, per-identity serialization, challenge stop handling, success metadata storage, and validation reports
- 2026-06-12 goal-04-catalog-sell-button: added guarded catalog sell action API for draft prepare, explicit publish confirmation, and status polling through bazos-service policy/queue guardrails
- 2026-06-12 goal-05-monitoring-reconciliation: added sanitized monitoring metrics, blocked-attempt and review-identity visibility, active-ad count reconciliation, stale submission expiry, safe policy-block logs, docs-rag token evidence, and validation reports

## Project Completion Marker

- 2026-06-21: Project marked completed/frozen after remote inventory. There are no active goals, active plans, open tasks, blockers, or pending human/AI actions. Do not ask for a new goal during routine status checks unless the owner explicitly creates one.
