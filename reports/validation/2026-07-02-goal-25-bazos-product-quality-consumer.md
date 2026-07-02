# GOAL-25 Bazos Product Quality Consumer Validation

```yaml
id: VAL-GOAL-25-BAZOS-PRODUCT-QUALITY-CONSUMER
status: deployed
created: 2026-07-02
last_updated: 2026-07-02
repository: /home/ssf/Documents/Github/bazos
branch: main
policy_id: catalog.product_quality.v1
primary_commit: bc1f7c6
runtime_mapping_commit: b583b10
deployed_image: localhost:5000/bazos-service:b583b10
```

## Artifact Validated

Bazos consumer integration for Catalog Goal 25 product-quality blockers before catalog product selection, draft preparation, and publish-adjacent queue confirmation.

## Intent Chain

Vision: Catalog remains the Statex product truth service for product identity, sellable content, pricing, media, and readiness.

Goal Impact: Bazos cannot create/update a draft or queue publishing from a Catalog product while mandatory Catalog product-quality blockers remain.

System: Catalog owns product quality; Bazos owns identities, drafts, compliance, queueing, pacing, duplicate checks, platform challenges, and publish actions.

Feature: Bazos consumer of `catalog.product_quality.v1`.

Task: Consume Catalog blockers and fail closed before Bazos draft/prepare/publish-adjacent flows.

Execution Plan: `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer-execution-plan.md`.

Coding Prompt: delegated worker prompt from Catalog Goal 25 orchestrator.

Code: files listed below.

Validation: this report.

## Implemented

- Added `CatalogClientService.getProductReadiness(productId, authorization)` plus internal service-token headers for runtime Catalog calls.
- Added `catalog.product_quality.v1` normalization without redefining Catalog product truth in Bazos.
- Blocked catalog sell-action `prepare` before Bazos draft create/update when mandatory Catalog blockers remain or Catalog readiness is unavailable.
- Re-checked and blocked `confirm` before `BazosPublisherQueueService.enqueueDraft` when Catalog blockers remain.
- Extended publish-policy preflight so publish-adjacent queue paths fail closed on Catalog quality blockers or Catalog unavailability.
- Preserved Bazos-owned identities, drafts, queueing, pacing, duplicate checks, Warehouse stock authority, challenge stop states, and publish actions.
- Kept EAN optional/non-blocking and surfaced sanitized blocker codes/messages in API/UI.
- Preserved Catalog draft lifecycle for Bazos-created Catalog products and avoided filtering out draft Catalog products during Bazos ad preparation.
- Mapped `CATALOG_INTERNAL_SERVICE_TOKEN` from the existing Auth secret into the Bazos runtime ExternalSecret.

## Subagent Review

- Code-review subagent found no functional TypeScript/Nest/UI response-shape defect, but requested expanded test/report coverage for policy and ad files.
- Deployment-readiness subagent found the runtime Catalog token mapping blocker.
- Both findings were addressed before deployment: expanded focused tests passed, report/state were refreshed, and `k8s/external-secret.yaml` now maps `CATALOG_INTERNAL_SERVICE_TOKEN` without printing the value.

## Commands Run

```text
git status --short --branch
# ## main...origin/main
# clean before work and clean before deploy

git diff --check
# PASS, no output

kubectl apply --dry-run=server -f k8s/external-secret.yaml -n statex-apps
# externalsecret.external-secrets.io/bazos-service-secret configured (server dry run)

npm --prefix shared test -- bazos-catalog-sell-action.service.spec.ts publish-policy.service.spec.ts bazos-ad.service.spec.ts
# PASS bazos/policy/publish-policy.service.spec.ts
# PASS bazos/catalog/bazos-catalog-sell-action.service.spec.ts
# PASS bazos/ad/bazos-ad.service.spec.ts
# 3 suites passed, 67 tests passed

npm --prefix shared run build
# PASS, tsc

npm --prefix services/aukro-service run build
# PASS, tsc && tsc-alias

git push origin main
# bc1f7c6..b583b10 main -> main

./scripts/deploy.sh
# Built and pushed localhost:5000/bazos-service:b583b10
# Applied Kubernetes manifests with image localhost:5000/bazos-service:b583b10
# Initial script wait timed out while the node was still pulling the image

kubectl rollout status deploy/bazos-service -n statex-apps --timeout=60s
# deployment "bazos-service" successfully rolled out

kubectl get deploy bazos-service -n statex-apps -o jsonpath="{.status.readyReplicas} {.status.updatedReplicas} {.status.availableReplicas} {.spec.template.spec.containers[0].image}"
# 1 1 1 localhost:5000/bazos-service:b583b10

curl -fsS https://bazos.alfares.cz/health
# {"status":"ok","service":"bazos-service","timestamp":"2026-07-02T21:52:57.957Z"}
```

## Runtime Smoke Evidence

Secret values were not printed.

```text
kubectl get secret bazos-service-secret -n statex-apps -o jsonpath="{.data.CATALOG_INTERNAL_SERVICE_TOKEN}" | wc -c
# 88

kubectl exec -i -n statex-apps <bazos-pod> -- node < /tmp/bazos_catalog_goal25_smoke.js
# {"qualityStatus":200,"qualitySuccess":true,"listedCount":0,"readiness":null,"tokenPresent":true,"policyId":"catalog.product_quality.v1"}

kubectl exec -i -n statex-apps <bazos-pod> -- node < /tmp/bazos_catalog_readiness_smoke.js
# {"status":200,"success":true,"hasIssuesArray":true,"issueCount":5,"tokenPresent":true,"policyId":"catalog.product_quality.v1"}
```

The first smoke proves the Bazos pod can authenticate to the stable Catalog review endpoint. The second smoke proves the Bazos pod can authenticate to the exact Catalog readiness endpoint used by the consumer integration.

## Invariant Evidence

- Bazos still does not call Bazos.cz directly.
- Bazos queueing still requires explicit confirmation and still delegates to the guarded queue.
- Bazos compliance gates for verified identity, pacing, duplicate checks, category cadence, active-ad caps, content policy, and challenge stop states were not weakened.
- Warehouse stock authority remains unchanged.
- Catalog readiness unavailable fails closed through `catalog_quality_unavailable`.
- EAN remains optional/non-blocking.
- No Catalog source files, Prisma schema, or migrations changed.

## Contract Evidence

Consumer policy id: `catalog.product_quality.v1`.

Mandatory blocker codes consumed/fail-closed: `missing_sku`, `duplicate_sku`, `missing_title`, `missing_description`, `missing_current_price`, `missing_image`, `placeholder_image_only`, `archived_product`, plus future Catalog blocking issues. Readiness-only draft/active lifecycle blockers are not treated as Goal 25 quality blockers in sell-action prepare so Bazos can still prepare drafts from Catalog draft products.

Catalog `GET /api/products/review/quality` was used for stable contract smoke. Exact per-product readiness was used for Bazos consumer decisions because the inspected Catalog review-list DTO does not expose an exact product-id filter.

## Replay And Determinism Evidence

Blocked prepare performs no Bazos draft create/update and no queue operation. Confirm and publish-policy paths re-check Catalog readiness immediately before queueing so a stale prepared draft cannot bypass newer Catalog blockers.

## Deployment Evidence

- Source commits pushed: `bc1f7c6 feat: consume catalog quality blockers`, `b583b10 fix: wire catalog token for bazos quality gate`.
- Deployed image: `localhost:5000/bazos-service:b583b10`.
- Rollout final state: ready=1, updated=1, available=1.
- Production health: `https://bazos.alfares.cz/health` returned HTTP 200 JSON `status=ok`.
- The deploy script itself exited nonzero after its initial rollout timeout; read-only follow-up showed the image pull completed and the deployment successfully rolled out. No corrective pod deletion or restart was required.

## Files Changed

- `.env.example`
- `docs/IMPLEMENTATION_STATE.md`
- `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer.md`
- `implementation-goals/GOAL-25-catalog-product-quality-bazos-consumer-execution-plan.md`
- `k8s/external-secret.yaml`
- `reports/validation/2026-07-02-goal-25-bazos-product-quality-pre-coding.md`
- `reports/validation/2026-07-02-goal-25-bazos-product-quality-consumer.md`
- `services/aukro-service/src/ui/ui.assets.ts`
- `shared/bazos/ad/bazos-ad.service.ts`
- `shared/bazos/ad/bazos-ad.service.spec.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.controller.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.spec.ts`
- `shared/bazos/policy/publish-policy.service.ts`
- `shared/bazos/policy/publish-policy.service.spec.ts`
- `shared/bazos/policy/publish-policy.types.ts`
- `shared/clients/catalog-client.service.ts`

## Blockers

None for the Goal 25 Bazos consumer deployment.

Residual non-blocking notes:

- Deploy image build logs still report existing npm audit warnings; no dependency remediation was in this Goal 25 scope.
- Catalog review-list smoke returned zero listed blocker rows at runtime, so exact readiness smoke used a prior Catalog validation product id.

## Commit And Deploy Status

Committed and pushed:

- `bc1f7c6 feat: consume catalog quality blockers`
- `b583b10 fix: wire catalog token for bazos quality gate`

Deployed:

- `localhost:5000/bazos-service:b583b10`

## Next Action

Return to the Catalog Goal 25 orchestrator for cross-channel integration handoff. No Bazos deployment blocker remains.
