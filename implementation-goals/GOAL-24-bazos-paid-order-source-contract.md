# GOAL-24 Bazos Paid Order Source Contract

## Purpose

Define the Bazos-owned source contract required before the protected order-affinity replay endpoint may emit real `marketplace.order_affinity_candidate.v1` events.

## Intent Trace

Bazos compliance policy -> Project invariants -> Related-products/order-affinity plan -> Bazos paid order source contract -> fail-closed replay producer -> validation report.

## Goal Impact

Marketing can already call the Bazos replay endpoint, but the endpoint must not invent paid purchase evidence from ads, listings, cancelled orders, or request-time payloads that were never persisted. This contract defines the exact producer facts Bazos must own before recurring Bazos affinity publishing can be enabled.

## Current Evidence

- `prisma/schema.prisma` persists `BazosOrder` header fields only: account, optional Bazos/central order IDs, customer contact fields, total/currency/status/forwarded, and timestamps.
- There is no persisted Bazos order item table, item snapshot JSON, payment status, paid timestamp, checkout status, or provider-backed Bazos order source in the Bazos schema.
- `OrdersService.create(...)` can map request-time `items`, `orderItems`, `lines`, or `products` into central Orders, but those item lines are not retained in Bazos for replay.
- Live Orders lifecycle read for `channel=bazos` currently shows two central Bazos rows, both `status=cancelled`, `paymentStatus=pending`, and `itemCount=1`; these are not eligible for order-affinity replay.
- Marketing dry-run through central Orders for `channel=bazos` returns zero input records and zero candidates.
- Marketing dry-run through the protected Bazos endpoint returns HTTP 200 with zero events and aggregate-only ledger evidence.

## Required Source Contract

Bazos replay may emit an event only when all of the following Bazos-owned facts exist:

1. Paid order eligibility
   - A persisted Bazos order has an approved paid/processable state.
   - Required future fields or equivalent approved projection: `paymentStatus=paid` and `paidAt`, or an owner-approved status mapping proving the order is paid without copying provider payment payloads.
   - Cancelled, pending, failed, unpaid, disputed, or unknown-status orders are ineligible.

2. Persisted item snapshots
   - Bazos persists bounded item snapshots at order ingestion time.
   - Each replayable snapshot contains only: `orderId`, `catalogProductId`, optional `sku`, `quantity`, optional `unitPrice`, optional `totalPrice`, optional `currency`, and an internal non-sensitive line reference or hash if needed for idempotency.
   - At least two distinct `catalogProductId` values are required for one order to emit a replay event.

3. Source boundary
   - Future snapshots may come from synthetic/internal Bazos order payloads or an approved real provider ingestion path.
   - Bazos must not infer purchases from ads/listings, draft state, publication attempts, stock state, abandoned inquiries, customer messages, or central Orders rows that Bazos cannot tie back to a local persisted paid order projection.

4. Sensitive data exclusion
   - Replay storage and output must not include customer email/phone, address, payment provider details, transaction IDs, tokens, cookies, raw provider payloads, Bazos verification data, or tracking/shipment fields.

5. Replay output
   - Event type: `marketplace.order_affinity_candidate.v1`.
   - Source: `bazos-service`.
   - Payload: `orderId` must be a replay-safe synthetic reference or hash, `channel=bazos`, optional `currency`, and bounded `items[]`.
   - The endpoint must continue to return explicit `[MISSING: ...]` blockers whenever any required source fact is absent.

## Proposed Implementation Workstreams

| Workstream | Status | Owner role | Objective | Allowed files | Forbidden files | Dependencies | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bazos paid source schema | blocked | Bazos backend owner | Add paid status/projection and persisted item snapshots | Bazos Prisma schema, migration/runbook, focused tests | Marketing, Catalog, Orders schema, secrets, Bazos publishing controls | owner-approved Bazos paid order source contract and DB migration window | Prisma validation, focused orders spec, migration dry-run |
| Bazos ingestion persistence | dependency-gated | Bazos backend owner | Persist bounded item snapshots from approved order ingestion paths | Bazos orders service/spec | raw payload storage, payment/provider/address/customer leakage | schema workstream | focused create/webhook tests |
| Bazos replay emission | dependency-gated | Bazos backend owner | Emit bounded replay events for paid multi-product local orders | Bazos orders service/controller/spec, validation docs | Catalog writes, Marketing changes, schedule activation | schema + ingestion persistence | focused replay tests, Marketing dry-run |
| Runtime publish activation | blocked | Integration owner | Decide whether Bazos recurring publish can be scheduled | Marketing schedule/config docs only | live Catalog publish without owner approval | live dry-run with non-zero safe candidates, pruning policy | Marketing dry-run, owner approval |

## Non-Goals

- No Bazos marketplace scraping, posting, verification bypass, CAPTCHA/device/session automation, or provider webhook invention.
- No raw payment/provider/customer/address storage.
- No Catalog mutation or recurring Marketing schedule activation from this contract.
- No DB migration without explicit owner-approved migration window.

## Current Decision

The current endpoint must remain fail-closed. The runtime auth and HTTP route are complete, but the replay source remains blocked by:

- `[MISSING: Bazos paid order history source]`
- `[MISSING: Bazos persisted order item replay source]`
- `[MISSING: Bazos order item ingestion contract]`
