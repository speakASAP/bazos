# Goal 24 Bazos Paid Order Source Implementation Validation

Date: 2026-07-03

## IPS Chain

Vision -> marketplace purchase history can improve related-product evidence without leaking sensitive data.
Goal Impact -> Bazos can now replay only locally persisted paid multi-product order snapshots instead of inventing evidence from ads, cancelled orders, or central Orders rows.
System -> Bazos owns the local paid order projection and protected replay source, Marketing consumes dry-run/replay output, Catalog remains unchanged.
Feature -> Bazos `marketplace.order_affinity_candidate.v1` replay source backed by bounded Bazos order fields.
Task -> implement owner-approved Bazos paid source fields, snapshot persistence, and replay emission.
Execution Plan -> Bazos-owned schema/service/spec/docs only; SQL migration file plus live DB application; no Marketing, Catalog, Orders, Kubernetes manifest, secret, or unrelated dirty-work edits.
Coding Prompt -> fail closed on missing source facts, exclude sensitive data, require paid multi-product snapshots, and keep schedule activation blocked until live evidence exists.
Code -> Prisma `BazosOrder` projection fields, SQL migration, order ingestion snapshot persistence, protected replay event builder, focused Jest coverage.
Validation -> pending targeted Jest/build/git diff checks, migration application, deploy, and Marketing dry-run.
State Update -> owner-approved source/migration window converted previous source blockers into implementation and runtime validation evidence.

## Scope

Allowed files changed:

- `prisma/schema.prisma`
- `migrations/2026-07-03-bazos-paid-order-replay-source.sql`
- `services/bazos-service/src/channel/orders/orders.service.ts`
- `services/bazos-service/src/channel/orders/orders.service.spec.ts`
- `implementation-goals/GOAL-24-bazos-paid-order-source-contract.md`
- `reports/validation/2026-07-03-goal24-bazos-paid-order-source-implementation.md`
- `docs/IMPLEMENTATION_STATE.md`

Forbidden files not edited: Marketing, Catalog, Orders, Kubernetes manifests, secrets, and unrelated runtime/source files.

## Sensitive Data Boundary

Replay storage/output contains only hashed order references, channel, currency, Catalog product IDs, optional SKU, quantity, and optional item prices. Customer contact fields, address fields, provider payment details, transaction IDs, tokens, cookies, raw marketplace payloads, and Bazos verification/session data are not emitted.

## Validation Evidence

- Allegro producer compatibility inspected in `/home/ssf/Documents/Github/allegro`: proven replay event shape uses `type=marketplace.order_affinity_candidate.v1`, `eventVersion=1`, hashed replay refs, `source=<marketplace-service>`, and payload `items[].productId`.
- Marketing marketplace replay contract inspected in `/home/ssf/Documents/Github/marketing-microservice`: Bazos path is `/internal/bazos/order-affinity/replay-candidates`; parser accepts `marketplace.order_affinity_candidate.v1` from `bazos-service`; payload items must use `productId`, optional `sku`, `quantity`, `unitPrice`, and `totalPrice`.
- `npx prisma generate` passed after adding `BazosOrder.paymentStatus`, `paidAt`, and `itemSnapshots`.
- Focused Bazos orders spec passed: `NODE_PATH=/home/ssf/Documents/Github/bazos/shared/node_modules:/home/ssf/Documents/Github/bazos/node_modules ./shared/node_modules/.bin/jest --config services/bazos-service/jest.config.js services/bazos-service/src/channel/orders/orders.service.spec.ts --runInBand` -> 1 suite, 17 tests passed.
- Bazos service build passed: `npm --prefix services/bazos-service run build`.
- Pre-migration live metadata check confirmed existing `bazos_orders` columns use quoted camelCase names.
- Owner-approved live DB migration applied from the Bazos pod through idempotent raw SQL; verified columns: `itemSnapshots`, `paidAt`, `paymentStatus`.
- `git diff --check` and `git diff --cached --check` passed before final commit.
- Branch commit pushed: `7365edc feat: persist bazos paid order replay source` on `codex/goal24-bazos-paid-order-source`.
- Deployment from branch commit `7365edc` passed with `./scripts/deploy.sh`; image `localhost:5000/bazos-service:7365edc` built, pushed, applied, and rolled out successfully.
- Post-deploy pod status: `bazos-service-5c96b8ff7c-lv5x4`, image `localhost:5000/bazos-service:7365edc`, ready `true`, restarts `0`.
- Production health check: `https://bazos.alfares.cz/health` returned HTTP 200.
- Protected endpoint aggregate probe from the Bazos pod returned HTTP 200, `success=true`, `contract=marketplace.order_affinity_candidate.v1`, `channel=bazos`, `count=0`, `skippedRecords=0`, `failClosed=false`, `blockers=[]`, `eventSampleCount=0`.
- Marketing pod dry-run against `http://bazos-service:3900` returned `dry_run_passed`, `inputRecords=0`, `acceptedCreatedEvents=0`, `rejectedRecords=0`, `aggregatePairs=0`, `candidateCount=0`, and `idempotencyKeyCount=0`.

## Blockers

- `[RESOLVED: live Bazos paid multi-product order replay evidence via budget source dry-run goal24-bazos-budget-paid-source-20260703-001]`
- `[MISSING: owner approval to activate recurring Bazos affinity publish after live dry-run evidence]`
