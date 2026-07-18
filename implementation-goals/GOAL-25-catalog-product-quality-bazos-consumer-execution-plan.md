# GOAL-25 Bazos Catalog Product Quality Consumer Execution Plan

## Metadata

```yaml
id: BAZOS-GOAL-25-CATALOG-PRODUCT-QUALITY-CONSUMER
status: source-validated-deploy-approved-follow-up
owner: catalog-goal-25-bazos-worker
created: 2026-07-02
last_updated: 2026-07-02
repository: /home/ssf/Documents/Github/bazos
branch: main
no_deploy_without_owner_approval: true
```

## Upstream Traceability

Vision: Catalog is the product truth service for sellable content and readiness.

Goal Impact: Products with Catalog mandatory quality blockers must not enter Bazos draft/prepare/publish-adjacent flows.

System: Catalog owns product quality; Bazos owns channel compliance and publication workflow.

Feature: Bazos consumer of `catalog.product_quality.v1`.

Task: Fail closed before Bazos draft mutation and queue confirmation when Catalog blockers remain.

Execution Plan: this file.

Coding Prompt: delegated worker prompt from Catalog Goal 25 orchestrator.

Code: bounded files listed below.

Validation: focused tests, builds, diff check, validation report.

## Goal

Integrate Bazos catalog sell-action prepare/confirm flows with Catalog product-quality blockers while preserving all Bazos compliance guardrails.

## Goal Impact

The change prevents incomplete Catalog product truth from becoming a Bazos draft or queued publish attempt. It does not relax Bazos identity verification, pacing, active-ad caps, category cadence, duplicate checks, Warehouse stock authority, or challenge stop behavior.

## Current State

- Remote worktree `/home/ssf/Documents/Github/bazos` is clean on `main` at preflight.
- Existing sell-action prepare creates/reuses a local draft, caps stock by Warehouse, evaluates Bazos publish policy, and returns a preview without queueing.
- Existing confirm requires explicit user confirmation and delegates queueing to `BazosPublisherQueueService`.
- Catalog Goal 25 exposes `catalog.product_quality.v1`; exact per-product quality evidence is available through Catalog readiness with the same blocker codes, while `GET /api/products/review/quality` does not currently expose an exact product-id filter.
- Subagent readiness review found that the source consumer needs runtime access to Catalog's shared internal service token; Bazos maps `CATALOG_INTERNAL_SERVICE_TOKEN` from the existing Auth secret without printing the value.

## Project Invariants

- Preserve Bazos no-public-posting-API rule: no direct Bazos publish path added.
- Preserve verification/challenge stop states: no SMS, bank, CAPTCHA, device, cookie, ban, or session bypass added.
- Preserve pacing and queue ownership: confirmation still delegates only to the guarded Bazos queue.
- Preserve duplicate/content gates: Bazos policy checks remain in `PublishPolicyService`/queue flow.
- Preserve stock ownership: Warehouse stock gate remains Warehouse-owned and unchanged.
- Preserve sensitive-data handling: no tokens, cookies, phone codes, or raw secrets logged.

## Sensitive-Data Handling

Only sanitized product IDs, policy IDs, blocker codes, and messages may be returned/logged. No Authorization header, token, cookie, Bazos session, customer identifier, or secret value may be printed.

## Contract Validation Plan

- Use Catalog-owned readiness/quality response as the source of blocker codes.
- Normalize the consumer response to `policyId: catalog.product_quality.v1`.
- Treat Catalog readiness failures as `catalog_quality_unavailable` and fail closed.
- Do not treat EAN warnings as blockers.
- Do not change Catalog endpoints or Bazos public API names.

## Replay/Determinism Plan

Prepare remains idempotent for reusable drafts only after quality passes. Blocked quality preflight performs no Bazos draft mutation. Confirm re-checks Catalog quality immediately before queueing so stale prepared drafts cannot bypass newer blockers.

## Scope

### Files To Inspect

- `shared/bazos/catalog/bazos-catalog-sell-action.service.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.controller.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.dto.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.spec.ts`
- `shared/clients/catalog-client.service.ts`
- `services/bazos-service/src/ui/ui.assets.ts`
- Catalog contract/report files listed in the goal.

### Files To Create

- `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer.md`
- `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer-execution-plan.md`
- `reports/validation/2026-07-02-goal-25-bazos-product-quality-pre-coding.md`
- `reports/validation/2026-07-02-goal-25-bazos-product-quality-consumer.md`

### Files To Modify

- `shared/clients/catalog-client.service.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.controller.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.spec.ts`
- `shared/bazos/policy/publish-policy.types.ts`
- `shared/bazos/policy/publish-policy.service.ts`
- `shared/bazos/policy/publish-policy.service.spec.ts`
- `shared/bazos/ad/bazos-ad.service.ts`
- `shared/bazos/ad/bazos-ad.service.spec.ts`
- `services/bazos-service/src/ui/ui.assets.ts`
- `k8s/external-secret.yaml`
- `.env.example`
- `docs/IMPLEMENTATION_STATE.md`

### Files That Must Not Be Modified

- Catalog microservice source files.
- Prisma schema/migrations unless a separate owner-approved plan exists.
- Bazos publisher queue, identity, pacing, duplicate, challenge, and publish-action ownership except through existing preflight calls.
- Kubernetes/deploy scripts and unrelated Kubernetes resources; `k8s/external-secret.yaml` is allowed only for Catalog internal-token runtime mapping.
- Secret values or generated runtime secret material.

## Implementation Steps

1. Add `CatalogClientService.getProductReadiness(productId, authorization)`.
2. Inject Catalog client into `BazosCatalogSellActionService`.
3. Add quality preflight normalization and fail-closed unavailable handling.
4. Call preflight in `prepare` before `findOrCreateDraft` and in `confirm` before `queue.enqueueDraft`.
5. Include `catalogQuality` and policy failure details in API responses.
6. Render Catalog quality blockers in the catalog publish UI and disable confirmation while blocked.
7. Extend publish policy and Bazos ad draft preparation tests for Catalog quality blockers and draft lifecycle preservation.
8. Map `CATALOG_INTERNAL_SERVICE_TOKEN` for Bazos runtime service-to-service Catalog readiness calls.
9. Run validation commands and update reports/state.

## Test Plan

- Focused Jest specs: `npm --prefix shared test -- bazos-catalog-sell-action.service.spec.ts publish-policy.service.spec.ts bazos-ad.service.spec.ts`.
- Build shared package to catch constructor/client typing issues.
- Build service UI package to catch asset/script syntax issues.
- Server-side Kubernetes dry run for `k8s/external-secret.yaml` to validate the runtime token mapping shape without mutating the cluster.

## Validation Plan

- `git diff --check` must pass.
- Focused tests must pass.
- `kubectl apply --dry-run=server -f k8s/external-secret.yaml -n statex-apps` must pass before deployment.
- `npm --prefix shared run build` must pass.
- `npm --prefix services/bazos-service run build` must pass.
- No deployment without explicit owner approval.

## Gate Commands

```text
git status --short --branch
git diff --check
npm --prefix shared test -- bazos-catalog-sell-action.service.spec.ts publish-policy.service.spec.ts bazos-ad.service.spec.ts
kubectl apply --dry-run=server -f k8s/external-secret.yaml -n statex-apps
npm --prefix shared run build
npm --prefix services/bazos-service run build
```

## Documentation Updates

- Record pre-coding and final validation reports.
- Append implementation state with changed files, validation evidence, blockers, and commit/no-commit status.

## Rollback Plan

Revert the bounded Bazos files listed above and remove the Goal 25 reports if the integration fails validation before commit. No deployment or data mutation is planned.

## Parallel Execution

Status: final integration in one worker.

Ready now: backend consumer, UI display, tests, and reports are small but share the same API response contract and test surface.

Dependency-gated: production deploy is blocked until owner approval.

Blocked: no separate worker should modify `shared/bazos/catalog/bazos-catalog-sell-action.service.ts`, `shared/clients/catalog-client.service.ts`, or `services/bazos-service/src/ui/ui.assets.ts` during this slice.

Integration owner: this worker.

Validation owner: this worker.

Merge order: documentation gate -> client/service -> UI -> tests -> validation report/state -> optional orchestrator commit/deploy decision.

## Agent Handoff Prompt

Implement only the Bazos consumer side of Catalog Goal 25 product quality blockers. Use Catalog-owned readiness/quality evidence, fail closed before draft mutation and queue confirmation, preserve Bazos compliance ownership, run focused tests/builds, do not deploy without explicit owner approval, and report blockers with `[MISSING: ...]` or `[UNKNOWN: ...]`.

## Completion Checklist

- [x] Required reading complete.
- [x] Pre-coding gate recorded.
- [x] Catalog quality preflight implemented.
- [x] Runtime Catalog token mapping added.
- [x] UI blockers surfaced.
- [x] Focused tests added/passing.
- [x] Builds/diff check completed.
- [x] Validation report written.
- [x] Implementation state updated.
- [x] Commit or no-commit reason recorded.
