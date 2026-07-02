# GOAL-25 Bazos Product Quality Consumer Validation

```yaml
id: VAL-GOAL-25-BAZOS-PRODUCT-QUALITY-CONSUMER
status: source-validated
created: 2026-07-02
repository: /home/ssf/Documents/Github/bazos
branch: main
policy_id: catalog.product_quality.v1
```

## Artifact Validated

Bazos consumer integration for Catalog Goal 25 product quality blockers before catalog sell-action draft preparation and publish-adjacent queue confirmation.

## Validation Scope

- Catalog client exact product readiness consumer.
- Bazos catalog sell-action prepare preflight.
- Bazos catalog sell-action confirm preflight.
- UI blocker rendering in the Catalog publish flow.
- Focused service tests and TypeScript builds.
- No production deployment.

## Intent Chain

Vision: Catalog remains the Statex product truth service for product identity, sellable content, pricing, media, and readiness.

Goal Impact: Bazos cannot create/update a draft or queue publishing from a Catalog product while mandatory Catalog product-quality blockers remain.

System: Catalog owns product quality; Bazos owns identities, drafts, compliance, queueing, pacing, duplicate checks, platform challenges, and publish actions.

Feature: Bazos Catalog sell-action quality preflight.

Task: Consume Catalog blockers and fail closed before Bazos draft/prepare/publish-adjacent flows.

Execution Plan: `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer-execution-plan.md`.

Coding Prompt: delegated worker prompt from Catalog Goal 25 orchestrator.

Code: files listed below.

Validation: this report.

## Implemented

- Added `CatalogClientService.getProductReadiness(productId, authorization)` for exact Catalog-owned readiness evidence.
- Added `catalog.product_quality.v1` normalization in `BazosCatalogSellActionService` without redefining Catalog product truth.
- Blocked `prepare` before Bazos draft create/update when Catalog quality blockers remain or Catalog readiness is unavailable.
- Re-checked and blocked `confirm` before `BazosPublisherQueueService.enqueueDraft` when Catalog quality blockers remain.
- Returned sanitized `catalogQuality` details, blocker codes/messages, and policy failures in the API response.
- Rendered Catalog quality blockers in the Catalog publish UI and kept confirmation disabled while blocked.
- Added focused tests for blocked prepare, unavailable Catalog readiness, and blocked confirm. Existing draft/queue/policy behavior remains covered.

## Not Implemented

- No Catalog source changes.
- No Prisma schema or migration changes.
- No Bazos publisher queue, identity, pacing, duplicate, challenge, or direct publish changes.
- No production deployment or runtime smoke because deployment approval was not part of this worker scope.

## Commands Run

```text
git status --short --branch
# ## main...origin/main
# clean before work

npm --prefix shared test -- bazos-catalog-sell-action.service.spec.ts
# PASS bazos/catalog/bazos-catalog-sell-action.service.spec.ts
# 1 suite passed, 13 tests passed

git diff --check
# PASS, no output

npm --prefix shared run build
# PASS, tsc

npm --prefix services/aukro-service run build
# PASS, tsc && tsc-alias
```

## Gate Evidence

Pre-coding gate: `reports/validation/2026-07-02-goal-25-bazos-product-quality-pre-coding.md`.

Execution plan: `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer-execution-plan.md`.

Goal impact: `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer.md`.

## Invariant Evidence

- Bazos still does not call Bazos.cz directly.
- Bazos queueing still requires explicit confirmation and still delegates to the guarded queue.
- Bazos compliance gates for verified identity, pacing, duplicate checks, category cadence, active-ad caps, content policy, and challenge stop states were not weakened.
- Warehouse stock authority remains unchanged.
- EAN remains optional/non-blocking because warning issues are surfaced as optional opportunities and do not block Bazos preflight.
- Catalog readiness unavailable fails closed through `catalog_quality_unavailable`.

## Sensitive-Data Scan Evidence

No secrets, tokens, cookies, raw phone data, verification codes, or payment data were printed or persisted. The Authorization header is passed through to Catalog but not logged. API/UI output contains sanitized blocker codes/messages only.

## Contract Evidence

Consumer policy id: `catalog.product_quality.v1`.

Mandatory/future Catalog blocking issues fail closed. Readiness-only non-quality blockers `draft_product` and `inactive_product` are excluded to match the inspected Catalog Goal 25 activation-blocker filter; `archived_product` remains blocking.

Catalog `GET /api/products/review/quality` was inspected and does not currently expose an exact product-id query in the DTO. The exact per-product readiness endpoint is used as the bounded Catalog-owned source allowed by the worker prompt.

## Replay And Determinism Evidence

Blocked prepare performs no Bazos draft create/update and no queue operation. Confirm re-checks Catalog readiness immediately before queueing so a stale draft cannot bypass newer Catalog blockers.

## Passed Criteria

- Source worktree was clean before edits.
- Pre-coding docs were created.
- Product quality blockers fail closed before draft mutation and queue confirmation.
- UI surfaces blocker codes/messages.
- Focused tests and builds passed.
- Deployment was not run.

## Failed Criteria

None for source validation.

## Blockers

- `[MISSING: explicit deployment approval]` for production rollout.
- `[UNKNOWN: authenticated runtime Catalog readiness smoke token]` for an end-to-end live UI/API smoke beyond source validation.

## Files Changed

- `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer.md`
- `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer-execution-plan.md`
- `reports/validation/2026-07-02-goal-25-bazos-product-quality-pre-coding.md`
- `reports/validation/2026-07-02-goal-25-bazos-product-quality-consumer.md`
- `shared/clients/catalog-client.service.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.controller.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.spec.ts`
- `services/aukro-service/src/ui/ui.assets.ts`
- `docs/IMPLEMENTATION_STATE.md`

## Commit Or No-Commit Reason

No commit was created by this delegated worker turn. The validated source is intentionally left dirty for orchestrator review, final integration commit, and deployment decision.

## Deployment Status

Not deployed. No deployment approval was provided in this worker thread.

## Recommendation

Orchestrator should review the bounded diff, commit if accepted, then request explicit deployment approval before any production rollout.

## Next Action

Orchestrator review and commit/deploy decision.
