# Goal 24 Bazos Affinity Eligibility Mapping Validation

Date: 2026-07-03

## Artifact Validated

Branch `codex/goal24-bazos-affinity-replay-contract`.

## Validation Scope

Resolve `[MISSING: Bazos paid multi-product replay eligibility mapping]` by proving whether Bazos currently has a paid multi-product order replay source and by making the protected replay endpoint fail closed with exact Bazos-owned blockers.

## IPS Chain

Vision -> marketplace purchase history can improve related-product evidence without leaking customer, address, payment, provider, token, or raw marketplace payload data.
Goal Impact -> Bazos no longer has an ambiguous eligibility-mapping blocker; it is explicitly ineligible until a paid order-history source and persisted item replay source exist.
System -> Bazos owns the replay producer and eligibility filters; Marketing owns aggregation; Catalog owns relation persistence.
Feature -> protected Bazos replay endpoint with fail-closed zero-event behavior.
Task -> inspect Bazos order/listing/sell-action source and expose exact Bazos paid-history blocker.
Execution Plan -> Bazos-owned source/spec/docs only; no Catalog, Marketing, Orders, payment, deployment, secret, or runtime mutation.
Coding Prompt -> do not invent backend fields, do not emit sensitive data, and replace ambiguous paid multi-product eligibility with exact `[MISSING: ...]` markers.
Code -> `services/aukro-service/src/aukro/orders/orders.service.ts` and focused spec assertions.
Validation -> focused spec, service build, and `git diff --check`.
State Update -> Bazos paid multi-product replay is source-ineligible until the missing Bazos producer prerequisites exist.

## Source Evidence

- `prisma/schema.prisma` `BazosOrder` has no item-line table/relation, item snapshot JSON, paid timestamp, payment status, provider transaction, checkout lifecycle, or paid/processable enum.
- `OrdersService.create` can map request-time item lines into central Orders, but `toBazosOrderData` persists only local order header fields and omits the source lines.
- `getOrderAffinityReplayCandidates` remains read-only and returns `count=0`, `events=[]`, and `failClosed=true`.
- `BazosCatalogSellActionService` and `BazosAdService` own listing/draft/publish flows; they do not create paid buyer order history.

## Eligibility Decision

Bazos cannot currently produce paid multi-product replay candidates. The old blocker `[MISSING: Bazos paid multi-product replay eligibility mapping]` should be considered resolved into these exact Bazos-owned blockers:

- `[MISSING: Bazos paid order history source]`
- `[MISSING: Bazos persisted order item replay source]`
- `[MISSING: Bazos order item ingestion contract]`

## Sensitive Data Evidence

The replay endpoint emits only owner/channel/filter/count/blocker metadata and an empty `events` array. It does not emit customer email, customer phone, buyer identity, address, payment/provider fields, raw marketplace payloads, tokens, credentials, or secret names.

## Commands Run

- `NODE_PATH=/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-affinity-replay-contract/shared/node_modules:/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-affinity-replay-contract/node_modules ./shared/node_modules/.bin/jest --config services/aukro-service/jest.config.js services/aukro-service/src/aukro/orders/orders.service.spec.ts --runInBand` -> pass, 14 tests.
- `NODE_PATH=/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-affinity-replay-contract/services/aukro-service/node_modules:/home/ssf/Documents/Github/codex-worktrees/bazos-goal24-affinity-replay-contract/node_modules npm --prefix services/aukro-service run build` -> pass.
- `git diff --check` -> pass.

Validation note: the isolated worktree used temporary uncommitted `node_modules` symlinks to the canonical `/home/ssf/Documents/Github/bazos` install for validation only; the symlinks were removed before staging.

## Blockers

- `[MISSING: Bazos paid order history source]`
- `[MISSING: Bazos persisted order item replay source]`
- `[MISSING: Bazos order item ingestion contract]`
- `[MISSING: runtime deployment and Marketing pod dry-run evidence for Bazos replay endpoint]`

## Recommendation

Do not schedule or publish Bazos marketplace-affinity replay. Merge this branch only as fail-closed eligibility evidence; future Bazos eligibility requires an owner-approved paid order ingestion and persisted item replay contract.
