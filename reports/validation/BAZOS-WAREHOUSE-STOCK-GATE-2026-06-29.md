# Bazos Warehouse Stock Gate Validation

Date: 2026-06-29
Status: validated

## Intent Preservation Chain

- Vision: Warehouse remains the stock authority across channel publish flows.
- Goal Impact: Bazos must not queue or publish sellable listings from caller-provided stock values when Warehouse evidence is missing or unavailable.
- System: `bazos-service` on `alfares:/home/ssf/Documents/Github/bazos-service`.
- Feature: Bazos guarded publisher queue and Catalog sell action publish policy.
- Task: Add the smallest Bazos-side fail-closed stock safety gate.
- Execution Plan: Gate publish policy evaluation because enqueue and claim both call `PublishPolicyService`.
- Coding Prompt: Delegated remote-only Bazos stock safety task from stock orchestrator.
- Code: `shared/bazos/policy/publish-policy.service.ts`, `shared/bazos/policy/publish-policy.types.ts`, `shared/bazos/policy/publish-policy.service.spec.ts`, `docs/BAZOS_COMPLIANCE.md`, `docs/IMPLEMENTATION_STATE.md`.
- Validation: focused policy spec passed; `git diff --check`, shared build, shared tests, and root tests passed.

## Known Facts

- Warehouse availability and route evidence are required before Bazos publish queueing/claiming.
- Local `BazosAd.stockQuantity` is not sellable truth.
- [UNKNOWN: live Warehouse response shape beyond existing `getStockByProduct` and `getTotalAvailable` clients]


## Validation Commands

- `npm --prefix shared test -- --runTestsByPath bazos/policy/publish-policy.service.spec.ts` - PASS, 1 suite, 38 tests.
- `git status --short --branch` - PASS, intended files only before commit.
- `git diff --check` - PASS, no whitespace errors.
- `npm --prefix shared run build` - PASS.
- `npm --prefix shared test` - PASS, 6 suites, 104 tests.
- `npm test` - PASS, 6 suites, 104 tests.

## 2026-06-30 Warehouse Event Stock Orchestration

Status: validated in source

### Intent Preservation Chain

- Vision: Warehouse remains the only sellable quantity authority for Bazos-linked Catalog products.
- Goal Impact: Bazos listings and local sale surfaces stop advertising stock that Warehouse no longer reports as available.
- System: `bazos-service` on `alfares:/home/ssf/Documents/Github/bazos-service`.
- Feature: RabbitMQ Warehouse stock-event projection for Bazos ads.
- Task: Handle `stock.updated` and `stock.out` events for linked products/ads without mutating Warehouse.
- Execution Plan: Reuse `stock.events` / `stock.bazos-service` subscriber; project Warehouse `available` into Bazos ad stock; force out-of-stock ads to local non-sellable/deleted state; persist durable evidence in `lastPolicyCheck.warehouseStockSync`; pace per-ad projection writes at 1 request/sec by default.
- Coding Prompt: Remote-only worker task to adapt the deployed Allegro Warehouse-only recurring stock orchestration policy to Bazos.
- Code: `shared/rabbitmq/stock-events.subscriber.ts`, `shared/rabbitmq/stock-events.subscriber.spec.ts`.
- Validation: focused RabbitMQ stock-event spec pass; shared build pass.

### Known Facts

- `stock.updated` uses the Warehouse event `available` value after non-negative integer normalization.
- `stock.out` forces target quantity `0`, sets `isActive=false`, and sets `publishStatus=deleted`, which is the existing local Bazos contract for removing a listing from the service sale surface.
- The handler records `lastPolicyCheck.warehouseStockSync` with event id, event type, previous state, target quantity, status, timestamps, pacing, and `mutatesWarehouse=false`.
- The default outbound pacing is `BAZOS_STOCK_WRITE_INTERVAL_MS=1000` ms; tests may set it to `0`.
- [UNKNOWN: Bazos has no approved server-side API contract in this repo for deleting or editing live public Bazos listings directly.]

### Validation Commands

- `npm --prefix shared test -- --runTestsByPath rabbitmq/stock-events.subscriber.spec.ts` - PASS, 1 suite, 4 tests.
- `npm --prefix shared run build` - PASS.
- `git diff --check` - PASS after removing one trailing blank line in this report.
- `npm --prefix shared test` - PASS, 7 suites, 111 tests.
- `npm test` - PASS, 7 suites, 111 tests.
- `npm --prefix services/aukro-service run build` - PASS.
