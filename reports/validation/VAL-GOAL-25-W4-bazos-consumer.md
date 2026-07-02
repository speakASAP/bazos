# VAL-GOAL-25-W4 Bazos Consumer Validation

```yaml
id: VAL-GOAL-25-W4-BAZOS-CONSUMER
status: source-validated
created: 2026-07-03
repository: /home/ssf/Documents/Github/bazos
branch: codex/goal-25-w4b-bazos-consumer-validation
upstream_catalog_origin_main: f453811
upstream_catalog_prerequisite: origin/main contains 877bf98
consumer_policy_id: catalog.product_quality.v1
```

## Objective

Validate Bazos consumption of the stable Catalog product-quality blocker contract after Catalog Goal 25 W1/W2 merged to `origin/main` at or after `877bf98`.

## Intent Preservation Chain

Vision: Catalog remains the Statex product truth service for product identity, sellable content, pricing, media, and readiness.

Goal Impact: Bazos must not prepare, confirm, or queue Bazos publishing from a Catalog product while mandatory Catalog product-quality blockers remain.

System: Catalog owns product-quality/readiness truth. Bazos owns Bazos identities, drafts, compliance, duplicate checks, pacing, challenge states, queueing, and publish actions. Warehouse owns stock.

Feature: Bazos consumer of the Catalog `catalog.product_quality.v1` blocker contract.

Task: Validate Bazos fail-closed behavior before draft preparation, publish confirmation, and publish-adjacent policy gates.

Execution Plan: `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer-execution-plan.md`.

Coding Prompt: Catalog Goal 25 W4B delegated worker prompt.

Code: Existing Bazos source files listed below; this W4B pass added only this validation report.

Validation: Focused tests/build/diff-check evidence below.

State Update: Bazos consumer is source-valid against the current Catalog contract; no additional Bazos code change was required in this pass.

## Upstream Catalog Evidence

Read-only Catalog checks showed:

```text
cd /home/ssf/Documents/Github/catalog-microservice
git merge-base --is-ancestor 877bf98 origin/main
# exit 0

git log --oneline --decorate origin/main -8
# f453811 (HEAD -> main, origin/main) docs: close deployed catalog follow-on goals
# 3697342 docs: refresh goal25 final runtime sweep
# a370d7b docs: close goal25 product quality admin
# 2b3132d docs: record goal25 final channel sweep
# aaedc96 docs: record goal25 channel runtime closure
# ac5c95b docs: record goal 25 live smoke refresh
# 0ee8231 docs: record goal 25 data blocker cleanup
# 4b7cfa0 docs: close goal25 channel consumer rollup
```

Catalog exposes `GET /api/products/:id/readiness` and the Goal 25 review contract with policy id `catalog.product_quality.v1`. No Catalog source files were modified by this worker.

## Bazos Source Evidence

Validated implementation points:

- `shared/clients/catalog-client.service.ts` exposes `getProductReadiness(productId, authorization)` and fails closed with `Catalog product readiness unavailable` when the Catalog readiness call cannot be completed.
- `shared/bazos/catalog/bazos-catalog-sell-action.service.ts` calls Catalog readiness before `findOrCreateDraft` in `prepare`; blocked Catalog quality returns `catalogQuality.allowed=false`, no draft, no queue, and `nextAction=resolve_catalog_quality_blockers`.
- The same service re-checks Catalog quality in `confirm` after explicit confirmation and before `BazosPublisherQueueService.enqueueDraft`; blocked Catalog quality returns the existing draft but does not queue.
- `shared/bazos/policy/publish-policy.service.ts` includes Gate 10 for Catalog product-quality authority and adds `POLICY_GATE.CATALOG_QUALITY_BLOCKED` when Catalog readiness has blocking issues, is not publishable, is unavailable, or the Catalog client/product id is missing.
- `shared/bazos/ad/bazos-ad.service.ts` keeps Bazos-created Catalog products as `isActive=false` and `lifecycle=draft`, preserving Catalog activation/review ownership.
- Bazos-specific compliance ownership remains in Bazos: identity verification, review/session state, active-ad cap, pacing, category cooldown, local/public duplicate checks, content policy evidence, challenge handling, and queueing remain Bazos-local gates.

## Blocker Behavior Validated

- Mandatory Catalog blockers block draft creation/update before Bazos draft mutation.
- Catalog readiness unavailability fails closed as `catalog_quality_unavailable`.
- Confirmation re-check prevents stale prepared drafts from queueing after Catalog blockers appear.
- Publish policy fails closed through `CATALOG_QUALITY_BLOCKED` before publish-adjacent queue paths.
- EAN/warning issues remain non-blocking in sell-action preflight.
- `draft_product` and `inactive_product` lifecycle issues are not treated as Goal 25 quality blockers in prepare, so Bazos can prepare a draft from a Catalog draft product while still requiring Catalog quality blockers to be clear.

## Files Inspected

- `/home/ssf/Documents/Github/bazos/shared/clients/catalog-client.service.ts`
- `/home/ssf/Documents/Github/bazos/shared/bazos/catalog/bazos-catalog-sell-action.service.ts`
- `/home/ssf/Documents/Github/bazos/shared/bazos/catalog/bazos-catalog-sell-action.service.spec.ts`
- `/home/ssf/Documents/Github/bazos/shared/bazos/policy/publish-policy.service.ts`
- `/home/ssf/Documents/Github/bazos/shared/bazos/policy/publish-policy.service.spec.ts`
- `/home/ssf/Documents/Github/bazos/shared/bazos/ad/bazos-ad.service.ts`
- `/home/ssf/Documents/Github/bazos/shared/bazos/ad/bazos-ad.service.spec.ts`
- `/home/ssf/Documents/Github/bazos/reports/validation/2026-07-02-goal-25-bazos-product-quality-consumer.md`
- `/home/ssf/Documents/Github/catalog-microservice/docs/contracts/catalog-product-quality-review.md`
- `/home/ssf/Documents/Github/catalog-microservice/src/products/products.controller.ts`
- `/home/ssf/Documents/Github/catalog-microservice/src/products/products.service.spec.ts`

## Files Changed By This W4B Pass

- `reports/validation/VAL-GOAL-25-W4-bazos-consumer.md`

## Validation Commands

Validation was run after creating this report.

```text
npm --prefix shared test -- bazos-catalog-sell-action.service.spec.ts publish-policy.service.spec.ts bazos-ad.service.spec.ts
npm --prefix shared run build
git diff --check
git status --short --branch
```

## Validation Evidence

```text
npm --prefix shared test -- bazos-catalog-sell-action.service.spec.ts publish-policy.service.spec.ts bazos-ad.service.spec.ts
# PASS shared/bazos/catalog/bazos-catalog-sell-action.service.spec.ts
# PASS shared/bazos/policy/publish-policy.service.spec.ts
# PASS shared/bazos/ad/bazos-ad.service.spec.ts
# Test Suites: 3 passed, 3 total
# Tests: 67 passed, 67 total

npm --prefix shared run build
# PASS, tsc completed

git diff --check
# PASS, no output
```

## Blockers

None for source validation.

Runtime/deploy note: this worker did not deploy and did not mutate production data. Existing prior validation report records Bazos runtime deployment of the Goal 25 consumer; this W4B pass was limited to current source validation and report normalization.

## Commit And Push Status

This report-only W4B branch is committed and pushed after validation; final worker handoff records the exact commit and push result.

## Next Step

Return this W4B evidence to the Catalog Goal 25 orchestrator for final cross-channel integration state update.
