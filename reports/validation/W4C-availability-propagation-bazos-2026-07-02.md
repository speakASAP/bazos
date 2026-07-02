# W4c Availability Propagation - Bazos

Date: 2026-07-02
Role: W4c Bazos/Aukro/Heureka Consumer Foundation worker
Repo: `/home/ssf/Documents/Github/bazos`

## Intent Chain

Vision -> Bazos remains a compliant classifieds integration and does not own Catalog or Warehouse truth.
Goal Impact -> Catalog non-sellability and Warehouse zero-stock must remove linked Bazos ads from local sale surfaces.
System -> `bazos-service` RabbitMQ consumers.
Feature -> Availability propagation for Catalog lifecycle and Warehouse stock events.
Task -> Add safe local consumer/foundation without external Bazos mutation.
Execution Plan -> Reuse local RabbitMQ module, persist idempotent state in `BazosAd.lastPolicyCheck`, keep external deletion blocked.
Coding Prompt -> W4c option 2 product availability propagation.
Code -> `CatalogProductEventsSubscriber` plus module/export/env wiring.
Validation -> focused shared tests, shared build, service build, root tests, `git diff --check`.

## Runtime Behavior

- Existing Warehouse `stock.out` path already forces linked `BazosAd` rows to `stockQuantity=0`, `isActive=false`, and `publishStatus=deleted`.
- New Catalog product event path handles:
  - `catalog.product.archived.v1`
  - `catalog.product.deleted.v1`
  - `catalog.product.inactive.v1`
  - `catalog.product.sellability_changed.v1` when `afterSellable=false`
  - status/update envelopes that clearly carry inactive, archived, deleted, or non-sellable state.
- Replayed events are idempotent through `lastPolicyCheck.catalogProductAvailabilitySync.eventId`.
- Sellable updates/category changes do not reactivate or refresh local ads yet.

## Blockers

- `[MISSING: approved Bazos external delete/de-list capability]`
- `[MISSING: safe catalog-event refresh policy]` for sellable `updated`, `upserted`, or `category_changed` events.
- `[UNKNOWN: live Catalog RabbitMQ exchange/routing configuration]`; defaults are documented in `.env.example` as `catalog.events` plus exact product lifecycle routing keys.

## External Mutation

No Bazos external delete/edit/post action is called. The handler only changes local Bazos service state.
