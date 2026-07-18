# GOAL-17 Bazos Order Forwarding

## Intent Preservation Chain

- Vision: Keep Bazos channel behavior compatible with product-level Catalog and Orders statistics without inventing sales.
- Goal Impact: Bazos must never report a central order unless every forwarded item is mapped to a Catalog product through a local Bazos ad.
- System: `bazos-service` remote repository on Alfares.
- Feature: Bazos order ingestion and central Orders forwarding.
- Task: Replace empty-item forwarding with product-mapped forwarding or a defensive unavailable result.
- Execution Plan: Inspect current order stub, map incoming Bazos ad line identifiers to `BazosAd.productId`, fail closed when the item ingestion contract is missing, and add focused validation.
- Coding Prompt: Catalog Goal 17 / Bazos channel workstream.
- Code: `services/bazos-service/src/channel/orders/orders.service.ts`.
- Validation: See `reports/validation/GOAL-17-bazos-order-forwarding-report.md`.

## Scope

Allowed:

- Bazos order ingestion and forwarding.
- Focused tests and status documentation.

Forbidden:

- Catalog and Orders repo edits.
- Publishing, CAPTCHA/SMS/bank/session/challenge flows.
- Listing mutation, deploy, payment, refund, stock, or customer-data exposure.

## Parallel Execution

- Workstream: Bazos order forwarding guard - status `ready now`; owner role `Bazos channel sub-agent`; files `services/bazos-service/src/channel/orders/*`; validation owner same session.
- Workstream: synthetic/internal order payload compatibility - status `ready now`; supports explicit `catalogProductId`/`productId` item payloads for validation and bounded internal ingestion.
- Workstream: true live Bazos order ingestion contract - status `blocked`; blocker `[UNKNOWN: live Bazos marketplace webhook support]`; requires owner/API contract input before another agent can safely implement live webhook ingestion.
- Final integration: original Catalog Goal 17 orchestrator; merge order `Bazos guard commit -> Catalog/Orders validator rerun`.

## 2026-07-01 Goal 7.2B Orders Canonical Create Readiness

### Purpose

Make Bazos order forwarding production-ready for the canonical Orders create contract when a true sellable Bazos order is available, while preserving the explicit blocker for live Bazos marketplace webhook support.

### Intent Trace

Vision -> Orders is the canonical lifecycle and statistics backbone for sellable channel orders.
Goal Impact -> Bazos can forward only true sellable order payloads that have canonical Catalog product IDs and Warehouse-owned warehouse IDs.
System -> `bazos-service` remains Bazos-local for ad publishing, identity/session, compliance, and stock projection; `orders-microservice` remains canonical order truth.
Feature -> Bazos Orders create caller readiness.
Task -> add accepted Orders internal auth headers, require `warehouseId` for every forwarded item, and keep missing live webhook support fail-closed.
Execution Plan -> update the shared Orders client and Bazos order item mapper, add focused specs, then run diff/build/test gates.
Coding Prompt -> remote-only Goal 7.2B delegated lane; do not edit Orders, secrets, DB rows, publishing/session/challenge flows, or unrelated UI/catalog-client work.
Code -> `shared/clients/order-client.service.ts`, `shared/clients/order-client.service.spec.ts`, `services/bazos-service/src/channel/orders/orders.service.ts`, `services/bazos-service/src/channel/orders/orders.service.spec.ts`, lane-local docs/status.
Validation -> focused service/client specs, `git diff --check`, shared build/test, service build where available.

### Scope

Allowed:

- Orders client transport headers for canonical create.
- Bazos order item mapping and fail-closed forwarding guards.
- Focused tests/specs and lane-local documentation/status.

Forbidden:

- Orders repository edits.
- Raw secrets, decoded tokens, customer/provider payload dumps, or DB mutations.
- Bazos publishing, identity/session, CAPTCHA/SMS/bank/challenge automation, listing mutation, or Warehouse mutations.
- Deploy/push while unrelated dirty work remains or live webhook/runtime credentials are unresolved.

### Acceptance Criteria

- `POST /api/orders` calls include `x-internal-service-token` from runtime configuration when present and `x-service-name: bazos-service`; token values are never logged.
- Every item sent to Orders has canonical `productId` and Warehouse-owned `warehouseId`.
- Missing `warehouseId` fails closed before calling Orders with bounded `[MISSING: Warehouse-owned warehouseId for Bazos order item]` evidence.
- Missing live Bazos marketplace webhook support remains `[UNKNOWN: live Bazos marketplace webhook support]`.
- Validation evidence is recorded in `reports/validation/GOAL-17-orders-canonical-create-readiness-2026-07-01.md`.
- Owner-approved synthetic runtime smoke passed on 2026-07-01: Bazos service headers were accepted by Orders, Warehouse handoff returned `reserved`, approved cleanup returned `cancelled`, and the fixture stock read returned `reserved=0`.

### Pre-Coding Gate

Decision: Accept.

Evidence:

- Remote repo `main` was clean before edits at `10514ac feat: show catalog content previews for Bazos drafts`.
- Required Bazos context from `AGENTS.md` and project process docs was read.
- Orders contracts read from `orders-microservice/docs/orchestrator/CHANNEL_ORDER_CREATE_CONTRACT.md`, `WAREHOUSE_HANDOFF_CONTRACT.md`, and `PRODUCTION_ORDER_INTEGRATION_PLAN.md`.
- Current Bazos order forwarding code inspected in `services/bazos-service/src/channel/orders/orders.service.ts`; live webhook remains synthetic/internal only.
- `BazosAd` has canonical `productId` but no dedicated persisted `warehouseId`; therefore order forwarding must require explicit order-line `warehouseId` or auditable ad metadata, otherwise fail closed.

Unresolved non-blocking markers:

- `[UNKNOWN: live Bazos marketplace webhook support]` blocks live smoke and true provider webhook ingestion, but does not block defensive canonical create readiness for synthetic/internal sellable payloads.
- Orders runtime credential/deploy gate for the synthetic Bazos smoke is resolved by owner-approved runtime evidence on 2026-07-01; final smoke passed with Warehouse reservation and cancellation cleanup. Keep the external Orders runtime prerequisite tracked in the Orders lane until `43f9774`/Warehouse service-token rotation is pushed or otherwise settled.

### Parallel Execution

No separate editing agents for this lane. Code edits are single-owner because the shared Orders client and Bazos order mapper are coupled by the item contract. Read-only validation subchecks may run in parallel. Integration owner and validation owner: this session. Merge order: docs/readiness -> client headers -> mapper warehouse guard -> tests -> status/report.

