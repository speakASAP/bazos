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
- 2026-04-05 documentation-standard-applied
- 2026-06-12 compliance-model: BazosIdentity service/controller, PublishPolicyService (8 gates), BazosAdService draft/challenge, unit tests
