# GOAL-03 Validation Report

## Artifact Validated

Goal 03 publisher queue and browser submit boundary on branch `codex/bazos-goal-03-publisher-queue`.

## Validation Scope

Validated queue enqueue, policy re-check, per-identity serialization, challenge stop handling, success metadata recording, draft-from-catalog endpoint wiring, and policy self-duplicate exclusion.

## Commands Run

- `npm --prefix shared test` - pass. 3 suites, 66 tests.
- `npm --prefix shared run build` - pass.
- `npm test` - pass. 3 suites, 66 tests.
- `git diff --check` - pass.
- `rg encryptedSession|cookie|password|verificationCode|smsCode|payment shared/bazos/publisher shared/bazos/ad shared/bazos/policy -n` - pass. Only hit is a test assertion that submission packets do not expose `encryptedSession`.

## Gate Evidence

- Pre-coding readiness gate: `reports/validation/GOAL-03-pre-coding-readiness.md` accepted.
- Execution plan: `implementation-goals/GOAL-03-execution-plan.md` complete.
- Remote state: existing unrelated `k8s/external-secret.yaml` remained outside Goal 03 scope.

## Invariant Evidence

- Verified identity/session gates are delegated to `PublishPolicyService` at enqueue and claim.
- Active-ad cap, pacing, category cadence, public duplicate, local duplicate, category mapping, and content gates remain fail-closed.
- Queue persists `notBefore` before worker wait through `BazosIdentityService.reservePublishSlot`.
- Claim refuses concurrent `submitting` attempts for the same identity.
- Challenge results update attempt, ad, and identity review/session states so automation pauses.
- Success results store Bazos ad ID and expiration, increment active count, and update category cadence.
- Submission packets do not include encrypted session payloads or raw secrets.

## Sensitive-Data Scan Evidence

No raw cookies, verification codes, passwords, payment details, or encrypted session values were added to logs, DTOs, reports, or submission packets. Tests use synthetic IDs and synthetic evidence only.

## Contract Evidence

Added API surface:

- `POST /api/bazos/ads/from-catalog`
- `POST /api/bazos/ads/:id/publish`
- `POST /api/bazos/offers/:id/publish`
- `GET /api/bazos/publish-queue`
- `POST /api/bazos/publish-queue/claim-next`
- `POST /api/bazos/publish-queue/attempts/:id/result`

Prisma schema was not changed because `BazosPublishAttempt`, `BazosAd`, identity pacing fields, active-ad count, and category cadence tables already existed.

## Replay And Determinism Evidence

- Enqueue is idempotent for existing queued/submitting attempts on the same ad and identity.
- Policy-selected delay is stored as attempt `notBefore` and identity `nextPublishNotBefore` before waiting.
- Claim re-checks policy immediately before returning a submission packet.
- Terminal results reject replay by refusing already terminal attempts.

## Passed Criteria

- Publish below 60 seconds per identity remains impossible through policy-selected delay and persisted `notBefore`.
- Active-ad cap and category cadence are enforced through policy service before enqueue and claim.
- Duplicate checks are required through local duplicate query and public evidence.
- Challenge states pause affected identity and draft.
- Successful publish stores Bazos ad ID and expiration.
- Unit tests cover the new queue lifecycle and policy self-duplicate regression.

## Failed Criteria

None.

## Deviations

No production deployment was performed. Existing unrelated dirty file `k8s/external-secret.yaml` was not modified for this goal.

## Recommendation

Accept Goal 03 implementation and commit the scoped changes.

## Next Action

Update implementation state, create Intent Compliance Report, and commit Goal 03.
