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
- 2026-06-12 goal-01-identity-session-compliance: completed IPS review and strengthened policy to fail closed on inactive sessions, missing/stale public duplicate evidence, missing/stale content-policy evidence, and all documented challenge states
- 2026-06-12 goal-02-human-verification-flow: added human verification session lifecycle, encrypted session envelope requirement, challenge/expiry stop states, and validation reports
- 2026-06-12 goal-03-publisher-queue: added guarded publish queue, idempotent enqueue, persisted 60-180s pacing reservation, claim-time policy re-check, per-identity serialization, challenge stop handling, success metadata storage, and validation reports
- 2026-06-12 goal-04-catalog-sell-button: added guarded catalog sell action API for draft prepare, explicit publish confirmation, and status polling through bazos-service policy/queue guardrails
