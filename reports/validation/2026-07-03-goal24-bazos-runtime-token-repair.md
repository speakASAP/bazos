# Goal 24 Bazos Runtime Token Repair Validation

Date: 2026-07-03

## Artifact Validated

Branch `codex/goal24-bazos-runtime-token-repair`.

## Validation Scope

Resolve `[MISSING: Bazos runtime internal replay token env accepted by /internal/bazos/order-affinity/replay-candidates]` at Bazos source/config level so the deployed endpoint can accept the existing runtime Bazos service token alias used by Marketing dry-run callers.

## IPS Chain

Vision -> marketplace purchase history can improve related-product evidence without leaking customer, address, payment, provider, token, or raw marketplace payload data.
Goal Impact -> Marketing can receive HTTP 200 from the protected Bazos replay endpoint after deployment while Bazos still fails closed with zero events until paid order-history prerequisites exist.
System -> Bazos owns the protected replay producer and runtime token acceptance; Marketing owns dry-run aggregation; Catalog remains unchanged and receives no dry-run writes.
Feature -> protected `marketplace.order_affinity_candidate.v1` replay endpoint at `/internal/bazos/order-affinity/replay-candidates`.
Task -> align Bazos runtime token env acceptance with existing deployed `JWT_TOKEN` alias and add Kubernetes `BAZOS_INTERNAL_SERVICE_TOKEN` alias mapping.
Execution Plan -> Bazos-owned source/config/docs/tests only; no Catalog, Marketing, Orders, payment, Warehouse, unrelated deploy, Vault value, or runtime secret value edits.
Coding Prompt -> accept only Marketing caller identity plus a configured internal token, preserve fail-closed zero-event response, and do not emit buyer/address/payment/provider/raw marketplace/secrets data.
Code -> `InternalOrderAffinityController` now falls back to configured `JWT_TOKEN`; `k8s/external-secret.yaml` maps `BAZOS_INTERNAL_SERVICE_TOKEN` from existing `secret/prod/bazos-service#JWT_TOKEN`; focused spec covers the runtime alias.
Validation -> focused orders spec, service build, ExternalSecret server dry run, and `git diff --check`.
State Update -> source/config blocker is resolved pending deployment and a Marketing pod dry-run returning HTTP 200 with fail-closed zero events.

## Commands Run

- `kubectl apply --dry-run=server -f k8s/external-secret.yaml` -> pass, `externalsecret.external-secrets.io/bazos-service-secret configured (server dry run)`.
- Initial focused spec without dependency symlinks -> failed before tests with missing dependency/Jest type resolution in the isolated worktree.
- Temporary validation symlinks to canonical `/home/ssf/Documents/Github/bazos` dependency installs were added for test/build only and removed before staging.
- `NODE_PATH=/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-runtime-token-repair/shared/node_modules:/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-runtime-token-repair/node_modules ./shared/node_modules/.bin/jest --config services/aukro-service/jest.config.js services/aukro-service/src/aukro/orders/orders.service.spec.ts --runInBand` -> pass, 15 tests.
- `NODE_PATH=/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-runtime-token-repair/services/aukro-service/node_modules:/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-runtime-token-repair/node_modules npm --prefix services/aukro-service run build` -> pass.
- `git diff --check` -> pass.

## Gate Evidence

- Pre-coding gate: pass with scoped owner delegation, required Bazos docs/reports/contract read, clean remote `main`, and isolated worktree branch.
- ExternalSecret gate: pass by server-side dry run; no secret values printed or changed.
- Deployment-readiness gate: not executed. Repository docs require explicit deployment readiness and owner intent; this worker did not deploy.
- Runtime dry-run gate: not executed because no deployment/restart was performed in this branch.

## Invariant Evidence

- No Bazos publishing, scraping, verification, CAPTCHA, phone identity, session, pacing, active-ad cap, duplicate, category cadence, browser automation, or external marketplace behavior changed.
- Endpoint remains protected by `x-service-name: marketing-microservice` and matching configured internal token.
- Replay response remains read-only, `count=0`, `events=[]`, and `failClosed=true`.

## Sensitive-Data Evidence

No customer/contact/address/payment/provider/raw marketplace data is emitted. No Vault values, Kubernetes secret values, decoded tokens, credentials, cookies, database rows, or raw order payloads were printed or committed. Tests use synthetic placeholder token strings only.

## Contract Evidence

Accepted runtime token sources are now:

- `BAZOS_INTERNAL_SERVICE_TOKEN`
- `INTERNAL_SERVICE_TOKEN`
- `JWT_TOKEN`

Kubernetes maps `BAZOS_INTERNAL_SERVICE_TOKEN` from the existing Bazos service-token Vault property so the preferred explicit env name exists after ExternalSecret sync and pod rollout. The `JWT_TOKEN` fallback preserves compatibility if only the legacy deployed alias is present.

## Passed Criteria

- Bazos source/config now accepts the runtime token alias previously observed in the Bazos pod.
- Focused controller/service spec covers the new alias.
- ExternalSecret renders server-side without schema/runtime admission failure.
- Service TypeScript build passes.
- Diff whitespace check passes.

## Remaining Blockers

- `[MISSING: deployment of codex/goal24-bazos-runtime-token-repair or equivalent main merge]`
- `[MISSING: Marketing pod dry-run evidence returning HTTP 200 with fail-closed zero Bazos events]`
- `[MISSING: Bazos paid order history source]`
- `[MISSING: Bazos persisted order item replay source]`
- `[MISSING: Bazos order item ingestion contract]`

## Recommendation

Merge/deploy this Bazos branch only through the normal Bazos deployment-readiness gate. After rollout, rerun the Marketing dry-run:

```bash
node dist/order-affinity-backfill.js --marketplace-url http://bazos-service:3900 --channel=bazos --limit=20 --dry-run --pretty
```

Expected post-deploy result: HTTP 200 from Bazos with `success=true`, `sourceOwner=bazos-service`, `count=0`, `events=[]`, `failClosed=true`, and the existing Bazos producer prerequisite blockers.
