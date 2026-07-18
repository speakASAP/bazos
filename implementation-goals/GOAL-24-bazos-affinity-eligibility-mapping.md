# GOAL-24 Bazos Affinity Eligibility Mapping

## Purpose

Resolve the Catalog Goal 24 blocker `[MISSING: Bazos paid multi-product replay eligibility mapping]` from the Bazos side without inventing paid order history or exposing sensitive marketplace data.

## Intent Trace

Bazos compliance policy -> Project invariants -> Catalog marketplace affinity contract -> Bazos eligibility proof -> fail-closed replay producer -> validation report.

## Goal Impact

Marketing and Catalog can treat Bazos as an implemented-but-ineligible replay source. The old generic blocker is replaced by Bazos-owned blockers that describe the real missing producer prerequisites.

## Current State Evidence

- `prisma/schema.prisma` defines `BazosOrder` with `accountId`, optional marketplace/central order ids, customer contact fields, `total`, `currency`, `status`, and `forwarded`. It has no persisted order-item relation, item snapshot JSON, paid timestamp, payment status, payment provider, transaction id, checkout state, or delivery/address projection.
- `services/bazos-service/src/channel/orders/orders.service.ts` can map request-time `items`, `orderItems`, `lines`, or `products` into central Orders when present, but those line items are not persisted in `bazos_orders` for replay.
- `toBazosOrderData` persists only the sanitized local order header fields and defaults `status` to `pending`; there is no Bazos-owned paid/processable status mapping.
- The protected replay endpoint returns zero events and explicit blockers, so no customer, address, payment, provider, token, or raw marketplace payload data can leave Bazos through this contract.

## Eligibility Mapping

Bazos has no current eligible paid multi-product replay population in source because the required producer facts are not implemented. The fail-closed mapping is:

| Required replay fact | Bazos source status | Mapping decision |
| --- | --- | --- |
| Paid/processable order history | `[MISSING: Bazos paid order history source]` | Reject all records; emit zero replay candidates. |
| At least two distinct Catalog product ids per order | `[MISSING: Bazos persisted order item replay source]` and `[MISSING: Bazos order item ingestion contract]` | Reject all records; do not infer from ad/listing history. |
| Safe replay payload without sensitive fields | implemented by zero-event response | Continue emitting aggregate metadata only. |

A future Bazos replay source may become eligible only after Bazos persists a repeatable paid order projection and item snapshots that map to Catalog product ids without buyer, address, payment/provider, token, or raw marketplace payload fields.

## Parallel Execution Plan

| Workstream | Status | Owner role | Objective | Allowed files | Forbidden files | Dependencies | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bazos eligibility blocker | ready now | Bazos worker | Replace generic paid multi-product blocker with exact fail-closed source blockers | Bazos orders source/spec, Goal 24 docs, validation report, implementation state | Catalog, Marketing, Orders, payments, k8s, secrets | Catalog contract already read | focused Bazos orders spec, service build, `git diff --check` |
| Marketing runtime dry-run | dependency-gated | Marketing/integration owner | Prove deployed Marketing can call protected Bazos endpoint | Marketing runtime/config reports only | Bazos source unless integration owner requests | Bazos branch merged/deployed and token mapping present | dry-run from Marketing pod |
| Future Bazos order source | blocked | Bazos product owner/worker | Define real paid order ingestion and persisted item replay source | new Bazos order ingestion docs/source/tests | raw sensitive payload exposure, payment/provider leakage | owner-approved Bazos order source contract | focused ingestion/replay tests |

Integration owner: Catalog/Marketing affinity orchestrator.
Validation owner: integration validator.
Merge order: Bazos eligibility branch, runtime token/deploy validation, future order-source branch only after owner approval.

## Validation

- Focused Bazos orders service spec.
- Bazos service build.
- `git diff --check`.
