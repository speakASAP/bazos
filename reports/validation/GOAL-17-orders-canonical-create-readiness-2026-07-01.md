# Goal 17 / Orders Goal 7.2B Bazos Canonical Create Readiness

Date: 2026-07-01
Status: validated in source, not deployed

## Intent Preservation Chain

- Vision: Orders is the canonical lifecycle and statistics backbone for supported sellable channel orders.
- Goal Impact: Bazos forwards to Orders only when every sellable order item has canonical Catalog and Warehouse ownership identifiers.
- System: `bazos-service` on `alfares:/home/ssf/Documents/Github/bazos-service` owns Bazos-local publishing/session/compliance; `orders-microservice` owns canonical order lifecycle.
- Feature: Bazos canonical Orders create readiness.
- Task: add accepted Orders auth headers and fail closed on missing `warehouseId` before calling Orders.
- Execution Plan: update shared Orders client headers, update Bazos item mapper, add focused specs, run validation gates, update state.
- Coding Prompt: Goal-driven lane Goal 7.2B; remote-only; no Orders repo edits; no secrets; no DB mutation; no deploy while blockers remain.
- Code: `shared/clients/order-client.service.ts`, `shared/clients/order-client.service.spec.ts`, `services/aukro-service/src/aukro/orders/orders.service.ts`, `services/aukro-service/src/aukro/orders/orders.service.spec.ts`, `implementation-goals/GOAL-17-bazos-order-forwarding.md`, `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`.
- Validation: focused Bazos mapper spec pass; focused shared Orders client spec pass; `git diff --check` pass; shared build pass; full shared/root tests pass; service build pass.

## Pre-Coding Readiness Gate

Decision: Accept.

Evidence:

- Remote preflight: `git status --short --branch` returned clean `## main...origin/main`; latest commit `10514ac feat: show catalog content previews for Bazos drafts`.
- Orders contracts read: `CHANNEL_ORDER_CREATE_CONTRACT.md`, `WAREHOUSE_HANDOFF_CONTRACT.md`, `PRODUCTION_ORDER_INTEGRATION_PLAN.md`.
- Bazos required docs read: `AGENTS.md`, `README.md`, `BUSINESS.md`, `SPEC.md`, `SYSTEM.md`, `PLAN.md`, `TASKS.md`, compliance/process/state docs, and Goal 17 report.
- Current code inspection found `OrderClientService` posted without internal service headers and Bazos order items lacked `warehouseId` in forwarded payloads.
- `BazosAd` persists `productId` but no dedicated `warehouseId`; missing route/location evidence must fail closed for Orders create.

## Implemented

- `OrderClientService` now sends `x-service-name: bazos-service` and, when configured, `x-internal-service-token` from runtime env without logging token values.
- The accepted runtime token env lookup supports `BAZOS_INTERNAL_SERVICE_TOKEN`, `ORDERS_INTERNAL_SERVICE_TOKEN`, and `ORDER_SERVICE_INTERNAL_TOKEN`.
- Orders create item typing now includes required `warehouseId`.
- Bazos order forwarding now requires a canonical Catalog `productId` and Warehouse-owned `warehouseId` before calling Orders.
- `warehouseId` can come from the incoming order line or bounded linked-ad policy metadata such as `lastPolicyCheck.draftOptions.warehouseStock.warehouseId`.
- Missing `warehouseId` fails closed before Orders create with `[MISSING: Warehouse-owned warehouseId for Bazos order item]`.
- Existing live webhook blocker remains explicit: `[UNKNOWN: live Bazos marketplace webhook support]`.

## Not Implemented

- No Orders repo edits.
- No DB mutation or migration.
- No deployment or push.
- No live Bazos marketplace webhook/order support was implemented because the repo has no provider-backed Bazos marketplace order contract.
- No live Orders create smoke was run because runtime credentials/deployment gate remain `[MISSING: Orders runtime credential/deploy gate]`.

## Live Support Evidence

- `services/aukro-service/src/aukro/orders/orders.controller.ts` exposes authenticated `POST /orders` and `POST /orders/webhook` only.
- `OrdersService.handleWebhook` unwraps `order`/`payload`/raw data and returns `Synthetic/internal Bazos order ingested` with `[UNKNOWN: live Bazos marketplace webhook support]`.
- Repo search found no Bazos provider order polling, seller-order endpoint, marketplace order item contract, or external Bazos webhook verifier beyond the synthetic/internal handler.

## Validation Commands

- `cd services/aukro-service && NODE_PATH=../../shared/node_modules ../../shared/node_modules/.bin/jest --config jest.config.js src/aukro/orders/orders.service.spec.ts --runInBand` - PASS, 1 suite, 7 tests.
- `npm --prefix shared test -- --runTestsByPath clients/order-client.service.spec.ts --runInBand` - PASS, 1 suite, 1 test.
- `git diff --check` - PASS.
- `npm --prefix shared run build` - PASS.
- `npm --prefix shared test` - PASS, 8 suites, 112 tests.
- `npm test` - PASS, 8 suites, 112 tests.
- `npm --prefix services/aukro-service run build` - PASS.

## Bazos Compliance Check

Pass by scope. The change does not publish, mutate listings, automate Bazos browser flows, bypass verification, alter CAPTCHA/SMS/bank/session/challenge handling, expose raw provider payloads, or mutate Warehouse. It only controls whether already-ingested bounded order payloads may be forwarded to canonical Orders.

## Sensitive Data Check

No raw token values, customer payload dumps, decoded credentials, cookies, payment details, provider payload dumps, or DB data were printed or committed. Tests use synthetic placeholder IDs and a non-secret fake token string.

## Replay And Determinism

Orders create keeps `orders.create.v1` and normalized `channelAccountId` idempotency. Missing `productId` or `warehouseId` returns deterministic unavailable forwarding before the Orders call. Successful synthetic/internal payloads remain retry-compatible through `externalOrderId`, `channel`, and `channelAccountId`.

## Risks And Blockers

- `[UNKNOWN: live Bazos marketplace webhook support]` still blocks true live Bazos order ingestion and live provider smoke.
- `[MISSING: Orders runtime credential/deploy gate]` still blocks production Orders create smoke until accepted service token wiring and deployment approval exist.
- `BazosAd` has no first-class `warehouseId`; durable Warehouse route selection should be made explicit in a future schema/contract if Bazos needs ad-derived Orders forwarding without order-line `warehouseId`.

## Files Changed

- `shared/clients/order-client.service.ts`
- `shared/clients/order-client.service.spec.ts`
- `services/aukro-service/src/aukro/orders/orders.service.ts`
- `services/aukro-service/src/aukro/orders/orders.service.spec.ts`
- `implementation-goals/GOAL-17-bazos-order-forwarding.md`
- `reports/validation/GOAL-17-orders-canonical-create-readiness-2026-07-01.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`

## Commit Or No-Commit Reason

No commit created in this delegated worker turn. Source is validated and intentionally left dirty for orchestrator review/commit because live webhook support and Orders runtime/deployment gates remain unresolved.

## Next Action

Provide or confirm the Bazos live order ingestion contract and accepted Orders runtime token/deploy gate, then commit and run a sanitized Orders create smoke.
