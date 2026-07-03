# Goal 24 Bazos Order-Affinity Replay Producer Validation

Date: 2026-07-03

## Artifact Validated

Branch `codex/goal24-order-affinity-replay-producer`.

## Commands Run

- `cd services/aukro-service && NODE_PATH=/home/ssf/Documents/Github/bazos/shared/node_modules:/home/ssf/Documents/Github/bazos/node_modules ./../../shared/node_modules/.bin/jest --config jest.config.js src/aukro/orders/orders.service.spec.ts --runInBand` -> pass, 13 tests.
- `NODE_PATH=/home/ssf/Documents/Github/bazos/services/aukro-service/node_modules:/home/ssf/Documents/Github/bazos/node_modules npm --prefix services/aukro-service run build` -> pass.
- `git diff --check` -> pass.

## Gate Evidence

The route is present and protected, but `bazos_orders` has no persisted item/rawData column. The producer therefore returns:

- `contract=marketplace.order_affinity_candidate.v1`
- `channel=bazos`
- `count=0`
- `events=[]`
- `failClosed=true`
- blocker `[MISSING: Bazos persisted order item replay source]`
- blocker `[MISSING: Bazos order item ingestion contract]`

## Bazos Compliance Check

No publishing, scraping, verification, CAPTCHA, phone identity, account/session, rate-limit, duplicate, category cadence, or live marketplace behavior changed.

## Sensitive Data

No customer/contact/address/payment/provider/token/raw payload data is emitted.

## Blockers

- `[MISSING: Bazos persisted order item replay source]`
- `[MISSING: Bazos order item ingestion contract]`
- `[MISSING: Marketing parser source allowlist for aukro-service/bazos-service]`
- `[MISSING: runtime deployment and Marketing pod dry-run evidence for Bazos replay endpoint]`
