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

## Recommendation

Merge and push the Bazos branch after validation. The source-level HTTP 404 blocker is addressed by the existing endpoint plus controller-level contract coverage. Do not schedule recurring Bazos publishes until a runtime dry-run proves the protected route and token mapping from the Marketing pod.
