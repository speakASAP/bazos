# GOAL-24 Bazos Order-Affinity Replay Producer

## Purpose

Expose a protected Bazos-owned order-affinity replay route so Marketing dry-run no longer receives HTTP 404, while failing closed because Bazos does not currently implement a paid order-history source and persisted Bazos orders do not retain replayable item lines.

## Intent Trace

Bazos compliance policy -> Project invariants -> Goal 24 order-affinity producer -> protected fail-closed endpoint -> validation report.

## Goal Impact

Marketing can distinguish an implemented-but-blocked Bazos producer from a missing route. No Bazos marketplace automation, publication, verification bypass, or live mutation is introduced.

## Scope

- `services/bazos-service/src/channel/orders/orders.controller.ts`
- `services/bazos-service/src/channel/orders/orders.module.ts`
- `services/bazos-service/src/channel/orders/orders.service.ts`
- `services/bazos-service/src/channel/orders/orders.service.spec.ts`
- Goal/report/state documentation

## Out Of Scope

- DB migrations.
- Persisting raw Bazos marketplace order payloads.
- Inventing live Bazos webhook support.
- Marketing/Catalog source allowlist changes.
- Production deployment in this worker turn.

## Acceptance Criteria

- Protected route exists at `GET /internal/bazos/order-affinity/replay-candidates`.
- Route requires Marketing internal service token and service name.
- Response uses `marketplace.order_affinity_candidate.v1`.
- Response fails closed with zero events and explicit blockers, including `[MISSING: Bazos paid order history source]`.
- No customer/contact/address/payment/provider/token/raw payload data is emitted.

## Validation

- Focused Bazos order-service spec.
- Service build.
- `git diff --check`.
