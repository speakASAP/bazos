# Bazos Business Health Channel Readback Handoff

## Intent Preservation

Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation

- Vision: `BUSINESS.md`
- Goal Impact: `implementation-goals/GOAL-26-bazos-business-health-channel-readback.md`
- System: `SYSTEM.md`
- Feature: Bazos channel readback business-health source envelope
- Task: add read-only/source-only Bazos channel readback endpoint and verifier
- Execution Plan: this handoff and `implementation-goals/GOAL-26-bazos-business-health-channel-readback.md`
- Coding Prompt: Codex prompt 2026-07-06 Bazos service-owned business-health channel readback envelope
- Code:
  - `services/bazos-service/src/business-health/business-health.controller.ts`
  - `services/bazos-service/src/business-health/business-health.service.ts`
  - `services/bazos-service/src/business-health/business-health.types.ts`
  - `services/bazos-service/src/business-health/business-health.module.ts`
- Validation:
  - `npm run verify:business-health-bazos-channel-contract`
  - `npm --prefix services/bazos-service run build`
  - `git diff --check`

## Contract

- Endpoint: `GET /bazos/business-health/channel-readback`
- Contract id: `bazos.channel_readback_business_health.v1`
- Business process contract: `stock-order-marketplace-business-health.v1`
- Owner: `bazos`
- Mode: source-only read-only evidence envelope

## Business Boundary

The envelope states the Bazos channel invariant for marketplace availability and order readback:

- Bazos must not publish or keep local sellable quantity higher than Warehouse/Catalog availability.
- Bazos must not keep a listing sellable when Catalog marks the product unavailable, deleted, archived, inactive, or not sellable.
- External Bazos readback and provider-backed order/status readback are required before runtime `pass`.
- External marketplace mutation remains gated by Bazos verification, challenge, pacing, duplicate, category, active-ad, content, provider, and human/operator approval rules.

## Safety Boundary

- No live Bazos/provider calls.
- No Bazos listing create, update, delete, de-list, import, sync, or order ingestion.
- No Orders, Warehouse, Catalog, payment, supplier, or provider service call.
- No DB query or mutation.
- No secret or environment change.
- No deploy.

## Source References

- `shared/bazos/reconciliation/bazos-availability-reconciliation.service.ts`
- `shared/bazos/catalog/bazos-catalog-sell-action.service.ts`
- `shared/bazos/policy/publish-policy.service.ts`
- `shared/rabbitmq/stock-events.subscriber.ts`
- `services/bazos-service/src/channel/orders/orders.service.ts`
- `docs/BAZOS_COMPLIANCE.md`
- `docs/orchestrator/2026-07-05-runtime-gate-packet-handoff.md`
- `reports/validation/2026-07-05-W8-bazos-provider-proof-gate.md`

## Preserved Blockers

- `[MISSING: approved live Bazos readback packet]`
- `[MISSING: target product/listing/account for Bazos channel readback proof]`
- `[UNKNOWN: live Bazos marketplace webhook support]`
- `[MISSING: provider-backed Bazos order item/status ingestion contract]`
- `[MISSING: approved reconciliation rule that maps Warehouse/Catalog availability to Bazos sellable quantity without external mutation side effects]`
- `[MISSING: owner-approved Bazos external delete/de-list capability]`

## Handoff To BPCP

`business-process-control-plane` can consume this envelope as Bazos-owned source evidence only. Until a live runtime packet exists, the BPCP plane should remain `warn` or `blocked`, not `pass`.

Suggested BPCP sourceRefs:

- `bazos/services/bazos-service/src/business-health/business-health.controller.ts`
- `bazos/services/bazos-service/src/business-health/business-health.service.ts`
- `bazos/docs/orchestrator/2026-07-06-bazos-business-health-handoff.md`
