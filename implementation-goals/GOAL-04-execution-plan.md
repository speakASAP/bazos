# GOAL-04 Execution Plan - Catalog Sell Button

```yaml
id: BAZOS-EP-04
status: approved
source_goal: implementation-goals/GOAL-04-catalog-sell-button.md
owner: project owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
```

## Metadata

- Goal: GOAL-04 Catalog Sell Button.
- Branch: `codex/bazos-goal-04-catalog-sell-button`.
- Remote repository: `alfares:/home/ssf/Documents/Github/bazos-service`.
- Production deployment: out of scope unless separately approved.

## Upstream Traceability

- `BUSINESS.md`: Bazos publishing must respect verified sessions, caps, pacing, category cadence, duplicate checks, and human review stops.
- `SPEC.md`: catalog products may be prepared and published only through bazos-service guarded flows.
- `docs/BAZOS_COMPLIANCE.md`: backend gates are mandatory; UI warnings alone are insufficient.
- `docs/governance/PROJECT_INVARIANTS.md`: no bypass of Bazos verification, rate, duplicate, category, active-ad, content, or challenge controls.
- `PLAN.md` Goal 4 and `TASKS.md`: product-level Sell on Bazos action must create a local draft and queue publish only through guardrails.
- Selected goal: `implementation-goals/GOAL-04-catalog-sell-button.md`.

## Goal

Expose a catalog-facing Sell on Bazos action that creates a local draft, returns identity/category/policy context, requires explicit user confirmation before publish queueing, and exposes publish status/failure reasons for polling.

## Goal Impact

Catalog users can initiate Bazos selling without direct posting capability. The catalog-side action is an orchestration layer over existing bazos-service draft, policy, and publisher queue services, preserving backend enforcement even if the catalog UI is bypassed.

## Current State

- Goal 01, 02, and 03 are completed.
- Existing backend supports `POST /api/bazos/ads/from-catalog`, `POST /api/bazos/ads/:id/evaluate-policy`, `POST /api/bazos/ads/:id/publish`, and queue polling.
- Remote branch was created from the Goal 03 branch.
- Dirty remote file observed and excluded from Goal 04: `k8s/external-secret.yaml`.
- No frontend or catalog-microservice source exists inside this repository; the implementable contract here is the bazos-service API consumed by catalog.

## Project Invariants

- Publishing uses no public Bazos API and no direct catalog submission path.
- Draft creation never submits to Bazos.
- Queueing remains delegated to `BazosPublisherQueueService`, which re-checks policy gates and pacing.
- Explicit confirmation is required before queueing publish.
- Policy and challenge failure states are returned to the caller for human action.
- No raw cookies, verification codes, passwords, payment details, or secrets are accepted or logged.

## Sensitive-Data Handling

- DTOs accept product and policy evidence only; no session, cookie, password, SMS, bank, or payment fields are introduced.
- Logs must include IDs and decision summaries only.
- Tests use synthetic UUIDs and no production data.
- Existing `encryptedSession` fields are not returned by the new catalog action status response.

## Contract Validation Plan

- Add catalog-action API endpoints under `api/bazos/catalog/products/:productId/sell-action`.
- Preview/create endpoint returns draft, selected identity summary, category mapping status, active-ad count, policy result, confirmation requirement, and next action.
- Confirm endpoint requires `confirmed === true` and publish evidence before delegating to guarded queue.
- Status endpoint returns the draft plus latest publish attempt and human-action reason when blocked/challenged.
- Validate with Jest service tests and TypeScript build.

## Replay/Determinism Plan

- Draft creation is idempotent per active product/identity draft where possible; the action returns an existing draft instead of creating duplicate active drafts.
- Publish confirmation delegates to Goal 03 queue idempotency for active queued/submitting attempts.
- Pacing selection and `notBefore` persistence remain owned by `BazosPublisherQueueService`.
- Status polling is read-only.

## Scope

- Add catalog sell action DTO/service/controller in `shared/bazos/catalog/`.
- Register the new service/controller in `shared/bazos/bazos.module.ts`.
- Add focused unit tests for preview, confirmation requirement, guarded queue delegation, blocked status, and challenge status.
- Update Goal 04 validation, intent compliance, implementation state, and task ledger.

## Non-Goals

- No production deployment.
- No direct Bazos browser/form submit from catalog action.
- No changes to verification/session storage.
- No bypasses or exceptions to publish policy.
- No frontend implementation outside this repository.
- No changes to `k8s/external-secret.yaml`.

## Files To Inspect

- `shared/bazos/ad/bazos-ad.service.ts`
- `shared/bazos/ad/bazos-ad.dto.ts`
- `shared/bazos/publisher/bazos-publisher-queue.service.ts`
- `shared/bazos/publisher/bazos-publisher-queue.dto.ts`
- `shared/bazos/policy/publish-policy.service.ts`
- `shared/bazos/identity/bazos-identity.service.ts`
- `prisma/schema.prisma`

## Files To Create

- `shared/bazos/catalog/bazos-catalog-sell-action.dto.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.controller.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.spec.ts`
- `reports/validation/GOAL-04-pre-coding-readiness.md`
- `reports/validation/GOAL-04-validation-report.md`
- `reports/validation/GOAL-04-intent-compliance-report.md`

## Files To Modify

- `shared/bazos/bazos.module.ts`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`

## Files That Must Not Be Modified

- `docs/BAZOS_COMPLIANCE.md`
- `docs/governance/PROJECT_INVARIANTS.md`
- `BUSINESS.md`
- `SPEC.md`
- `k8s/external-secret.yaml`
- Any production secret or environment file.

## Implementation Steps

1. Create catalog action DTOs for draft preview, publish confirmation, and status query contract.
2. Create service that finds or creates a product/identity draft through `BazosAdService`, evaluates policy, and returns policy/identity/category context.
3. Require explicit confirmation before queueing; on confirmation, call `BazosPublisherQueueService.enqueueDraft` with duplicate/content evidence.
4. Add status polling method that returns latest attempt, publish status, policy failures, and human-action challenge reason.
5. Register controller endpoints and module providers.
6. Add tests for no direct publish, confirmation requirement, queue delegation, blocked policy, and challenge reason surfacing.
7. Run validation commands and record reports.
8. Update state and commit or record no-commit reason.

## Test Plan

- `npm test`
- `npm --prefix shared test`
- `npm --prefix shared run build`
- `git diff --check`

## Validation Plan

Record command results in `reports/validation/GOAL-04-validation-report.md` and summarize compliance in `reports/validation/GOAL-04-intent-compliance-report.md`.

## Gate Commands

```bash
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git status --short --branch'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm test'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix shared test'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && npm --prefix shared run build'
ssh alfares 'cd /home/ssf/Documents/Github/bazos-service && git diff --check'
```

## Documentation Updates

- Update `docs/IMPLEMENTATION_STATE.md` with Goal 04 session report, changed files, validation evidence, and commit/no-commit record.
- Update `TASKS.md` completed ledger.
- Create validation and intent compliance reports.

## Rollback Plan

Revert the Goal 04 commit or remove the catalog action controller/service/DTO/test files and module registrations. Since no migration or deployment is planned, rollback is source-only and does not affect production runtime until a later approved deployment.

## Agent Handoff Prompt

Implement GOAL-04 Catalog Sell Button on branch `codex/bazos-goal-04-catalog-sell-button` by adding a catalog-facing bazos-service API that creates/reuses drafts, evaluates policy, requires explicit confirmation before publish queueing, delegates publishing only to `BazosPublisherQueueService`, and surfaces status/failure reasons for polling. Do not modify compliance policy, production secrets, or deployment files.

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
- [ ] Validation evidence recorded.
- [ ] Implementation state updated.
- [ ] Intent Compliance Report produced.
