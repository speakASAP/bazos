# B1 Central Orders Status Read Model Worker Validation

Date: 2026-07-02
Repo: `/home/ssf/Documents/Github/bazos`
Branch: `main`
Scope: bounded synthetic/internal Bazos Orders status read model only

## Summary

The current remote source state implements the bounded Bazos order cabinet/panel for synthetic/internal order records. It reads the stored central `BazosOrder.orderId`, displays central lifecycle/status when Orders detail is readable, and returns explicit `unforwarded`, `unknown`, or `stale` states when the central mapping or read is missing.

This worker did not invent a live Bazos marketplace webhook and did not deploy or push.

## Source State Verified

- `shared/clients/order-client.service.ts`: Orders detail read via `GET /api/orders/:id` and lifecycle fallback derivation.
- `services/bazos-service/src/channel/orders/orders.service.ts`: query filters, user account scoping, central read-model attachment, and non-ok central states.
- `services/bazos-service/src/channel/orders/orders.controller.ts`: query-based order list/detail reads.
- `services/bazos-service/src/ui/ui.controller.ts`: guarded `/ui/orders`, client scope, and admin scope.
- `services/bazos-service/src/ui/ui.module.ts`: Orders service wiring into the UI module.
- `services/bazos-service/src/ui/ui.assets.ts`: client/admin order panels and status labels.

Current worker diff adds focused spec coverage and this documentation. The source implementation was already present in the remote repo state before this report.

## Validation Commands

```bash
git diff --check
```

Result: pass.

```bash
npm --prefix shared test -- order-client.service.spec.ts
```

Result: pass, 1 suite and 3 tests.

```bash
npm --prefix shared run build
```

Result: pass.

```bash
cd services/bazos-service && NODE_PATH=../../shared/node_modules ../../shared/node_modules/.bin/jest --config jest.config.js src/channel/orders/orders.service.spec.ts --runInBand
```

Result: pass, 1 suite and 10 tests.

```bash
npm --prefix services/bazos-service run build
```

Result: pass.

## Validation Note

A direct root-level attempt to run the service spec with `npx jest --config services/bazos-service/jest.config.js ...` failed before executing tests because the service Jest config resolves `ts-jest` relative to `services/bazos-service`. The passing command above uses the shared package Jest install through `NODE_PATH=../../shared/node_modules`.

## Remaining Blockers

- `[UNKNOWN: live Bazos marketplace webhook support]`
- `[MISSING: Bazos order item ingestion contract]`
- `[MISSING: Warehouse-owned warehouseId for Bazos order item]`
- `[MISSING: provider-backed customer/admin order UI requirements beyond the bounded synthetic/internal read model]`

## Handoff

No provider webhook, credentials, deploy, or push were touched. The next integration owner should review the dirty tests/docs, decide whether to commit them with the existing source commits, and only then run any deployment workflow if owner-approved.
