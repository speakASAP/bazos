# Goal 24 Bazos Paid Order Source Contract Validation

Date: 2026-07-03

## Artifact Validated

`implementation-goals/GOAL-24-bazos-paid-order-source-contract.md`.

## Validation Scope

Read-only source/runtime assessment for whether Bazos can emit real order-affinity replay events today, and documentation of the future Bazos-owned source contract.

## IPS Chain

Vision -> marketplace purchase history can improve related-product evidence without leaking sensitive data.
Goal Impact -> Bazos replay source eligibility is explicit instead of inferred from ads, listings, or cancelled synthetic rows.
System -> Bazos owns local order source/projection, Orders owns canonical order lifecycle/item truth, Marketing aggregates, Catalog persists relations.
Feature -> Bazos paid order source contract for future `marketplace.order_affinity_candidate.v1` emission.
Task -> inspect schema/source/runtime and record exact blockers.
Execution Plan -> read-only runtime checks, docs only, no migration, no secret values, no Catalog publish.
Coding Prompt -> do not invent paid order source or copy forbidden customer/payment/provider data.
Code -> documentation only.
Validation -> schema/source inspection plus live aggregate dry-runs.
State Update -> source contract defined; implementation remains blocked pending approved Bazos paid order source and persisted item snapshots.

## Evidence

- Bazos `BazosOrder` schema has no persisted item relation/snapshot, payment status, paid timestamp, payment provider status, or paid checkout projection.
- Bazos `OrdersService.create(...)` maps request-time item lines into central Orders, but does not persist those lines in Bazos for replay.
- Orders lifecycle read for `channel=bazos` returned count `2`; sanitized rows were `status=cancelled`, `paymentStatus=pending`, `itemCount=1`.
- Marketing central Orders dry-run for `channel=bazos` returned `inputRecords=0`, `acceptedCreatedEvents=0`, `aggregatePairs=0`, `candidateCount=0`.
- Marketing Bazos endpoint dry-run already returns HTTP 200 and zero candidates with aggregate-only ledger evidence.

## Sensitive Data Check

No token values, raw order rows, customer contact values, address data, payment provider details, transaction IDs, cookies, or Bazos verification data were printed or added.

## Validation Commands

- `git status --short --branch` in Bazos -> clean before docs edit.
- Source inspection: `prisma/schema.prisma`, `services/bazos-service/src/channel/orders/orders.service.ts`, existing Goal 24 docs.
- Runtime sanitized Orders lifecycle probe from Bazos pod -> HTTP 200, count `2`, cancelled/pending/single-item summary only.
- Marketing central Orders Bazos dry-run -> zero records/candidates.
- `git diff --check` -> pending final docs commit validation.

## Recommendation

Do not enable recurring Bazos order-affinity schedule. Next implementation must start with an owner-approved Bazos paid order source schema/projection and item snapshot persistence, then replay emission tests.
