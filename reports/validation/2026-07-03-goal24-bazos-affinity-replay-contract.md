# Goal 24 Bazos Order-Affinity Replay Contract Validation

Date: 2026-07-03

## Artifact Validated

Branch `codex/goal24-bazos-affinity-replay-contract`.

## Validation Scope

Validate that the existing protected Bazos-owned replay endpoint is compatible with Marketing's marketplace replay caller for `sourceOwner=bazos-service`.

## IPS Chain

Vision -> marketplace purchase history can improve related-product evidence without leaking customer, address, payment, provider, token, or raw marketplace payload data.
Goal Impact -> Marketing can distinguish a reachable Bazos replay producer from an absent route and can fail closed on explicit producer blockers.
System -> Bazos owns its local order projection and replay source; Marketing owns aggregation; Catalog owns durable product relations.
Feature -> protected `marketplace.order_affinity_candidate.v1` replay source.
Task -> add controller-level auth/shape coverage for `GET /internal/bazos/order-affinity/replay-candidates`.
Execution Plan -> Bazos-owned test/doc updates only, no Marketing/Catalog/Orders/Kubernetes/secrets/migrations/runtime mutation.
Coding Prompt -> verify the Marketing service-token contract and keep zero-event fail-closed behavior until Bazos has persisted order-item replay data.
Code -> `services/aukro-service/src/aukro/orders/orders.service.spec.ts`.
Validation -> focused spec, service build, and `git diff --check` passed.
State Update -> endpoint contract is source-compatible; runtime Marketing dry-run/token mapping remains a separate validation step.

## Commands Run

- `NODE_PATH=/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-affinity-replay-contract/shared/node_modules:/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-affinity-replay-contract/node_modules ./shared/node_modules/.bin/jest --config services/aukro-service/jest.config.js services/aukro-service/src/aukro/orders/orders.service.spec.ts --runInBand` -> pass, 14 tests.
- `NODE_PATH=/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-affinity-replay-contract/services/aukro-service/node_modules:/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-affinity-replay-contract/node_modules npm --prefix services/aukro-service run build` -> pass.
- `git diff --check` -> pass.

Note: the isolated worktree used temporary uncommitted `node_modules` symlinks to the canonical `/home/ssf/Documents/Github/bazos` install for validation only; the symlinks were removed before staging.

## Contract Evidence

Marketing's marketplace replay path for `sourceOwner=bazos-service` is `/internal/bazos/order-affinity/replay-candidates`.

The Bazos controller requires:

- `x-service-name: marketing-microservice`
- `x-internal-service-token` matching `BAZOS_INTERNAL_SERVICE_TOKEN` or `INTERNAL_SERVICE_TOKEN`

The successful response shape remains:

- `success=true`
- `sourceOwner=bazos-service`
- `consumerOwner=marketing-microservice`
- `contract=marketplace.order_affinity_candidate.v1`
- `channel=bazos`
- `count=0`
- `events=[]`
- `failClosed=true`

## Bazos Compliance Check

No Bazos publishing, scraping, verification, CAPTCHA, phone identity, session, rate-limit, duplicate, category cadence, browser automation, or external marketplace behavior changed.

## Sensitive Data

No customer/contact/address/payment/provider/token/raw order/raw marketplace payload data is emitted. The controller test uses synthetic token strings only.

## Blockers

- `[MISSING: Bazos persisted order item replay source]`
- `[MISSING: Bazos order item ingestion contract]`
- `[MISSING: runtime deployment and Marketing pod dry-run evidence for Bazos replay endpoint]`
- `[MISSING: Bazos replay token mapping in Marketing runtime, if not already provided by the integration owner]`

## Runtime Deployment And Dry-Run Follow-Up

Date: 2026-07-03

Commands and evidence:

- `./scripts/deploy.sh` from Bazos `main` at `d91c361` built and pushed `localhost:5000/bazos-service:d91c361`.
- The deploy script initially timed out while the new pod was still pulling the image.
- Read-only follow-up `kubectl -n statex-apps rollout status deployment/bazos-service --timeout=180s` later passed.
- Deployment image: `localhost:5000/bazos-service:d91c361`.
- New pod: `bazos-service-75f86fc7f-fbcgj`, `READY=1/1`, `STATUS=Running`, `RESTARTS=0`.
- Marketing token-name check: `ORDER_AFFINITY_BAZOS_REPLAY_TOKEN=true`, `ORDER_AFFINITY_MARKETPLACE_REPLAY_TOKEN=true`, `BAZOS_INTERNAL_SERVICE_TOKEN=false`.
- Bazos token-name check: `BAZOS_INTERNAL_SERVICE_TOKEN=false`, `INTERNAL_SERVICE_TOKEN=false`.
- Marketing dry-run command: `node dist/order-affinity-backfill.js --marketplace-url http://bazos-service:3900 --channel=bazos --limit=20 --dry-run --pretty`.
- Marketing dry-run result: fail-closed HTTP 401, no Catalog write, no raw event/customer/address/payment/provider/token output.

Runtime blocker:

- `[MISSING: Bazos runtime internal replay token env accepted by /internal/bazos/order-affinity/replay-candidates]`

The source-level route compatibility blocker is resolved, but recurring Bazos replay must remain inactive until Bazos runtime receives the matching accepted internal token and Marketing dry-run returns HTTP 200 with the fail-closed zero-event contract.


## Runtime Token Alias Follow-Up

Date: 2026-07-03

Planned fix:

- Add `BAZOS_INTERNAL_SERVICE_TOKEN` to `bazos-service-secret` from the existing `secret/prod/bazos-service#JWT_TOKEN` Vault property.
- Do not print, rotate, or create a new token value.
- Preserve Marketing's existing `ORDER_AFFINITY_BAZOS_REPLAY_TOKEN` mapping from the same Bazos Vault property.
- Apply ExternalSecret, wait for the Kubernetes Secret key by name only, redeploy Bazos, then rerun the Marketing dry-run.

Validation target:

- Marketing Bazos dry-run should return HTTP 200 with `inputRecords=0`, `acceptedCreatedEvents=0`, `aggregatePairs=0`, and Bazos producer blockers for missing persisted order items, with no Catalog write.


## Recommendation

Merge and push the Bazos branch after validation. The source-level HTTP 404 blocker is addressed by the existing endpoint plus controller-level contract coverage. Do not schedule recurring Bazos publishes until a runtime dry-run proves the protected route and token mapping from the Marketing pod.
