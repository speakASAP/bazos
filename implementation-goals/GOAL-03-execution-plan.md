# GOAL-03 Execution Plan: Publisher Queue And Browser Submitter

```yaml
id: BAZOS-EP-03
status: approved
source_goal: implementation-goals/GOAL-03-publisher-queue-browser-submitter.md
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
```

## Metadata

Goal 03 implementation plan for the guarded Bazos publisher queue and compliant browser submit boundary on remote branch `codex/bazos-goal-03-publisher-queue`.

## Upstream Traceability

- `BUSINESS.md`: publish only through compliant browser/form flows with verified identities; never bypass verification, CAPTCHA, bank or device checks, duplicate controls, active-ad caps, category cadence, or rate controls.
- `SPEC.md`: publish attempts are serialized per identity and governed by required gates immediately before submission.
- `docs/BAZOS_COMPLIANCE.md`: pacing must reserve a persisted `notBefore` before waiting; challenge states stop automation; attempts must be idempotent.
- `docs/governance/PROJECT_INVARIANTS.md`: invariants 2-12.
- `implementation-goals/GOAL-03-publisher-queue-browser-submitter.md`: selected goal.

## Goal

Implement Goal 03: publish Bazos drafts only through a policy-gated queue that serializes attempts per identity, reserves randomized pacing before worker wait, re-checks policy immediately before submission, stops on challenges, and records Bazos ad metadata after success.

## Goal Impact

This goal turns draft publishing from an advisory policy check into an enforceable queue lifecycle. Enqueueing and claiming an attempt must pass the policy service, preserve per-identity pacing, prevent concurrent identity submissions, and record every blocked or completed attempt for audit.

## Current State

Remote repository inspected on 2026-06-12:

- Branch before work: `codex/bazos-goal-02-human-verification-flow`.
- Goal branch: `codex/bazos-goal-03-publisher-queue`.
- Dirty state before edits: unrelated `k8s/external-secret.yaml` already modified and excluded from this goal.
- Existing Bazos modules: `shared/bazos/identity/*`, `shared/bazos/policy/*`, `shared/bazos/ad/*`.
- Existing schema already includes `BazosAd`, `BazosPublishAttempt`, `BazosIdentityCategoryCadence`, and identity pacing fields.
- Existing policy service fails closed for identity and session state, active-ad cap, pacing, category cadence, local and public duplicate evidence, category mapping, and content-policy evidence.
- Gap: no Bazos-native queue service or controller, no idempotent enqueue lifecycle, no per-identity claim serialization, and no result recorder that updates ad ID, expiration, active count, cadence, and challenge state.

## Project Invariants

- Invariants 2-3: no public posting API is introduced; the submitter boundary returns a compliant submission packet and records human or browser outcomes only.
- Invariant 4: challenge result states update the ad and identity into paused human-review states.
- Invariant 5: policy re-check requires verified active sessions before claim.
- Invariant 6: queue scopes to the draft identity and does not auto-rotate identities.
- Invariant 7: active-ad cap remains enforced by `PublishPolicyService` before enqueue and claim.
- Invariant 8: queue persists randomized `notBefore` using the policy-selected delay before a worker waits; claim refuses another active attempt for the same identity.
- Invariant 9: category cadence remains enforced by policy and is recorded only after successful publish.
- Invariant 10: duplicate gates use policy evidence before enqueue and claim.
- Invariant 11: submission packets must not include raw encrypted cookies, verification codes, passwords, or payment details.
- Invariant 12: no production deployment is part of this goal.

## Sensitive-Data Handling

No production cookies, codes, passwords, payment data, or raw encrypted session values are logged or returned. Submission packets include identity display and contact metadata needed for a compliant form flow but never include `encryptedSession`. Tests use synthetic IDs and evidence. Logs include attempt IDs, ad IDs, identity IDs, statuses, and challenge states only.

## Contract Validation Plan

API contract adds queue endpoints under `api/bazos/ads` and the requested compatibility route `POST /api/bazos/offers/:id/publish` for enqueueing an existing Bazos draft by ID. DTOs declare duplicate and content evidence plus result fields. Prisma schema is inspected but not changed because queue tables and fields already exist. Validation runs root tests, shared tests, shared build, and whitespace diff check.

## Replay/Determinism Plan

Enqueue is idempotent by existing pending attempt lookup for the ad and identity before creating another queued attempt. Pacing is deterministic after enqueue because the selected delay is persisted into both identity `nextPublishNotBefore` and attempt `notBefore` before any worker wait. Claim re-checks policy immediately before submission and refuses concurrent active attempts for the same identity. Result recording is terminal for submitted, challenge, or failed attempts.

## Scope

- Add Bazos queue DTOs and service with idempotent enqueue, list, claim, submission packet, and result recording.
- Add local draft creation from catalog-like product data through the existing draft service contract.
- Add enqueue via `POST /api/bazos/ads/:id/publish` and `POST /api/bazos/offers/:id/publish`.
- Add unit tests for idempotent enqueue, policy-blocked enqueue, `notBefore` reservation, per-identity serialization, claim re-check failure, challenge stop state, and successful publish metadata updates.
- Update Goal 03 validation reports, implementation state, and task record.

## Non-Goals

- No CAPTCHA, SMS, bank, or device bypass.
- No production deployment.
- No catalog UI sell button.
- No real public Bazos scraping implementation beyond accepting required evidence generated by a compliant upstream check.
- No new Prisma migration unless schema gaps are discovered.
- No modification to Kubernetes secrets or deployment files.

## Files To Inspect

- `implementation-goals/GOAL-03-publisher-queue-browser-submitter.md`
- `reports/validation/GOAL-01-*`
- `reports/validation/GOAL-02-*`
- `prisma/schema.prisma`
- `shared/bazos/ad/*`
- `shared/bazos/identity/*`
- `shared/bazos/policy/*`
- `shared/bazos/bazos.module.ts`
- `shared/package.json`

## Files To Create

- `implementation-goals/GOAL-03-execution-plan.md`
- `reports/validation/GOAL-03-pre-coding-readiness.md`
- `reports/validation/GOAL-03-validation-report.md`
- `reports/validation/GOAL-03-intent-compliance-report.md`
- `shared/bazos/publisher/bazos-publisher-queue.dto.ts`
- `shared/bazos/publisher/bazos-publisher-queue.service.ts`
- `shared/bazos/publisher/bazos-publisher-queue.controller.ts`
- `shared/bazos/publisher/bazos-publisher-queue.service.spec.ts`

## Files To Modify

- `shared/bazos/bazos.module.ts`
- `shared/bazos/ad/bazos-ad.service.ts`
- `shared/bazos/ad/bazos-ad.controller.ts`
- `shared/bazos/ad/bazos-ad.dto.ts`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`

## Files That Must Not Be Modified

- `BUSINESS.md`
- `SPEC.md`
- `docs/BAZOS_COMPLIANCE.md`
- `docs/governance/PROJECT_INVARIANTS.md`
- `.env*`
- `k8s/*`
- `scripts/deploy.sh`

## Implementation Steps

1. Record this execution plan and the pre-coding readiness gate.
2. Add queue DTOs and service with idempotent enqueue, list, claim, submission packet, and result recording.
3. Wire queue provider and controller into `BazosModule` and expose publish endpoints.
4. Add draft-from-catalog DTO support through the existing draft creation service.
5. Add focused Jest tests for queue lifecycle, policy re-check, serialization, pacing reservation, challenge, and success updates.
6. Run validation commands and fix regressions.
7. Record validation and Intent Compliance Report.
8. Update implementation state and task record.
9. Commit or record no-commit reason.

## Test Plan

Run root tests, shared tests, shared build, and whitespace validation through SSH on the remote repository.

## Validation Plan

Validation report records command outcomes, invariant mapping, sensitive-data evidence, API contract evidence, and replay or determinism evidence in `reports/validation/GOAL-03-validation-report.md`.

## Gate Commands

- `ssh alfares` then `cd /home/ssf/Documents/Github/bazos-service && git status --short --branch`
- `ssh alfares` then `cd /home/ssf/Documents/Github/bazos-service && npm test`

## Documentation Updates

Update `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and Goal 03 validation reports only.

## Rollback Plan

Revert the Goal 03 commit or apply an inverse patch on `codex/bazos-goal-03-publisher-queue`. No production deployment or database migration is part of this plan.

## Agent Handoff Prompt

Implement Goal 03 only. Add a guarded Bazos publisher queue that uses `PublishPolicyService`, persists randomized pacing before waiting, serializes attempts per identity, re-checks policy before submission, records challenge and success outcomes, runs validation, updates state, and does not deploy.

## Completion Checklist

- [x] Required reading completed.
- [x] Goal impact recorded.
- [x] Scope matches selected goal.
- [x] Remote dirty state checked.
- [x] Bazos invariants checked.
- [x] Sensitive-data handling declared.
- [x] Contract impact declared.
- [x] Replay/determinism impact declared.
- [x] Pre-coding gate passed or blocking exception recorded.
- [x] Validation evidence recorded.
- [x] Implementation state updated.
- [x] Intent Compliance Report produced.
