# Bazos Central Orders Status Read Model Plan

Date: 2026-07-02
Parent plan: `orders-microservice/docs/orchestrator/2026-07-02-order-lifecycle-warehouse-status-rollout-plan.md`

## Objective

Bazos must forward active orders to central Orders and display central lifecycle state wherever order/customer/admin views exist.

## Current Evidence

- Prior validation found Bazos channel order smoke evidence.
- `[UNKNOWN: true provider-backed Bazos order webhook path.]`
- `[UNKNOWN: buyer-facing cabinet versus operator-only dashboard surface.]`

## Workstream

Owner role: Bazos order read-model owner
Status: partially blocked until provider path discovery

Allowed files:

- Bazos order service/dashboard files identified during discovery
- `docs/**`
- tests and validation reports

Forbidden files:

- provider credentials
- unrelated catalog source work

## Required Work

1. Inspect Bazos order ingestion and provider webhook path.
2. Confirm central Orders id mapping or mark `[MISSING: central Orders id mapping]`.
3. Render lifecycle stage from Orders API or lifecycle events.
4. Show unforwarded/stale orders as actionable.

## Validation

- provider-backed or documented simulator order creates central Orders row
- order dashboard/cabinet shows central lifecycle
- unknown provider path remains explicitly marked, not invented

## B1 Worker Result - 2026-07-02

Status: implemented in the current source state for the bounded synthetic/internal read model; provider-backed ingestion remains blocked.

Intent chain:

- Vision: central Orders remains the lifecycle authority for Bazos orders that have been forwarded to Orders.
- Goal Impact: Bazos users/operators can see whether a local Bazos order has a stored central `orderId`, a readable central lifecycle/status, or an explicit missing/stale state.
- System: Bazos service reads Orders detail by stored central id; it does not invent a marketplace webhook or provider payload contract.
- Feature: `/ui/orders` returns user-scoped or admin-scoped Bazos orders with `centralOrder.state` values `ok`, `unforwarded`, `unknown`, and `stale`.
- Task: expose the bounded order panel/cabinet in the existing client/admin UI surfaces and cover central read behavior with focused specs.
- Execution Plan: use stored `BazosOrder.orderId` and existing synthetic/internal records only; preserve provider-backed blockers as explicit `[MISSING]` / `[UNKNOWN]` facts.
- Coding Prompt: B1 Bazos limited central Orders status read-model worker.
- Code: current source state includes the read model in `shared/clients/order-client.service.ts`, `services/aukro-service/src/aukro/orders/orders.service.ts`, `services/aukro-service/src/aukro/orders/orders.controller.ts`, `services/aukro-service/src/ui/ui.controller.ts`, `services/aukro-service/src/ui/ui.module.ts`, and `services/aukro-service/src/ui/ui.assets.ts`; this worker added focused spec coverage.
- Validation: recorded in `reports/validation/2026-07-02-central-orders-status-read-model-worker.md`.

Bounded implementation notes:

- `OrderClientService.getOrderLifecycleStatus()` reads `GET /api/orders/:id` through the existing internal-service header path and derives lifecycle fields when Orders detail does not return a lifecycle projection.
- Bazos order reads include central status only when requested by `centralStatus`, `includeCentralStatus`, `central`, or `withCentral`.
- User reads are scoped to Bazos accounts owned by the Auth user id or linked identities; admin reads require existing admin access checks.
- UI `/client` and `/admin` now surface synthetic/internal Bazos orders, central lifecycle/status, and explicit non-ok states. This is not a provider webhook implementation.
- Current dirty worker diff is tests/docs only because the source implementation already existed in the remote repo state before this documentation update.

Remaining blockers:

- `[UNKNOWN: live Bazos marketplace webhook support]`
- `[MISSING: Bazos order item ingestion contract]`
- `[MISSING: Warehouse-owned warehouseId for Bazos order item]`
- `[MISSING: provider-backed customer/admin order UI requirements beyond the bounded synthetic/internal read model]`

Validation evidence:

- `git diff --check` passed.
- `npm --prefix shared test -- order-client.service.spec.ts` passed: 1 suite, 3 tests.
- `npm --prefix shared run build` passed.
- `NODE_PATH=../../shared/node_modules ../../shared/node_modules/.bin/jest --config jest.config.js src/aukro/orders/orders.service.spec.ts --runInBand` passed: 1 suite, 10 tests.
- `npm --prefix services/aukro-service run build` passed.

No deploy or push was performed in this worker scope.
