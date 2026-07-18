# W4 Bazos Orders Lifecycle Cabinet And Provider Proof

Date: 2026-07-05
Repo: `/home/ssf/Documents/Github/bazos`
Workstream: W4 Bazos cabinet/status proof
Status: source-verified, runtime buyer/admin smoke gated, provider-backed webhook proof missing

## Intent Preservation Chain

Vision -> Every sellable order is error-free and every customer/admin cabinet reflects the canonical Orders lifecycle.

Goal Impact -> Bazos buyer/admin surfaces expose central Orders lifecycle and delivery status instead of drifting to local lifecycle truth.

System -> Orders owns central order lifecycle; Warehouse owns stock/reservations/fulfillment/delivery status; Bazos owns channel ingestion and UI/read-model projection only.

Feature -> Bazos customer cabinet and admin order/status surfaces use the central Orders lifecycle read model and refresh controls.

Task -> Prove Bazos buyer/admin lifecycle surfaces use central Orders lifecycle, and separately document provider-backed webhook/status gaps without inventing provider contracts.

Execution Plan -> Read repo-local handoff and master plan, inspect Bazos shared Orders client plus UI/order service source, run `verify:orders-lifecycle-ui`, run focused source specs, run non-secret live health/guard smoke, and record exact blockers.

Coding Prompt -> Remote-only W4 Bazos proof agent; allowed Bazos shared order client, UI/frontend verifier docs/reports; forbidden provider webhook invention, broad schema changes, production provider writes, raw customer/payment/token output.

Code -> No runtime code changes in this pass. Existing source proof points are:

- `shared/clients/order-client.service.ts`: `getOrderLifecycleStatus()` reads Orders detail by central order id and normalizes lifecycle/payment/fulfillment/delivery fields from Orders.
- `services/bazos-service/src/ui/ui.controller.ts`: guarded `/ui/orders` forces `centralStatus: true`; client reads are scoped to the authenticated Bazos user, while admin reads require admin access.
- `services/bazos-service/src/channel/orders/orders.service.ts`: customer/admin order reads attach `centralOrder`; forwarded rows read central Orders, unforwarded/stale rows are explicit states; create forwarding uses central Orders and fails closed when item or Warehouse evidence is missing.
- `services/bazos-service/src/ui/ui.assets.ts`: buyer/admin summaries and order tables render central lifecycle/delivery state, stale/unforwarded states, and manual refresh controls.
- `scripts/verify-orders-lifecycle-ui.js`: static verifier checks all required Orders lifecycle stages and customer/admin refresh markers.

Validation -> See command evidence below.

## Source Proof

- Buyer surface: `renderOrders()` summarizes total orders, central Orders loaded count, unforwarded count, stale/unknown count, delivery waiting/in-progress/received-returned counts, then renders `orderTable()` and binds `data-refresh-client` to `renderClient()`.
- Admin surface: `renderAdmin()` calls `/ui/orders?scope=admin&limit=25`, summarizes central Orders count and delivery states, renders admin order table, and binds `refresh-admin-orders` to `renderAdmin()`.
- Shared order table: `orderTable()` displays Bazos local status separately from `Centrální Orders`, using `centralOrderLabel()` and `centralOrderNote()` for central lifecycle, payment, and delivery fields.
- API surface: `/ui/orders` is JWT guarded; admin scope requires admin access; non-admin reads call `findForUser(req.user?.id, query)` and central status is always requested by this UI route.
- Read model: `buildCentralOrderRead()` returns `state: ok` only after `OrderClientService.getOrderLifecycleStatus(centralOrderId)` succeeds; otherwise it returns explicit `unforwarded`, `unknown`, or `stale` states.

## Validation Evidence

Remote preflight:

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && pwd && git status --short --branch && git branch --show-current && git log -1 --oneline'
/home/ssf/Documents/Github/bazos
## main...origin/main [ahead 1]
main
6a4690d docs: plan error-free orders lifecycle
```

Focused UI lifecycle verifier:

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && npm run verify:orders-lifecycle-ui'
{"success":true,"lifecycleStagesCovered":13,"refreshCoverage":"manual customer/admin refresh markers present"}
```

Shared Orders client spec:

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && npm --prefix shared test -- order-client.service.spec.ts'
PASS clients/order-client.service.spec.ts
Test Suites: 1 passed, 1 total
Tests: 3 passed, 3 total
```

Bazos order service spec:

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos/services/bazos-service && NODE_PATH=../../shared/node_modules ../../shared/node_modules/.bin/jest --config jest.config.js src/channel/orders/orders.service.spec.ts --runInBand'
PASS src/channel/orders/orders.service.spec.ts
Test Suites: 1 passed, 1 total
Tests: 17 passed, 17 total
```

Diff check:

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && git diff --check'
pass, no output
```

Production health smoke:

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && curl -fsS https://bazos.alfares.cz/health'
{"status":"ok","service":"bazos-service","timestamp":"2026-07-05T08:04:20.817Z"}
```

Unauthenticated UI guard smoke:

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && curl -sS -o /tmp/bazos-ui-orders-noauth-body.txt -w "%{http_code}" https://bazos.alfares.cz/ui/orders?limit=1 && sed -n "1,3p" /tmp/bazos-ui-orders-noauth-body.txt'
401
{"statusCode":401,"message":"No token provided"}
```

## Runtime Smoke Boundary

No approved live buyer/admin bearer or browser session packet was available in this worker. The live `/ui/orders` route is guarded and correctly rejects unauthenticated access, but that is not sufficient to prove customer/admin cabinet data end to end.

`[MISSING: approved live Bazos buyer bearer/session packet for /ui/orders customer cabinet smoke]`

`[MISSING: approved live Bazos admin bearer/session packet for /ui/orders?scope=admin cabinet smoke]`

## Provider-Backed Webhook/Status Gap

This worker did not find or add a provider-backed Bazos order webhook/status contract. Existing source keeps the boundary explicit:

- `services/bazos-service/src/channel/orders/orders.service.ts` defines `LIVE_BAZOS_WEBHOOK_SUPPORT = '[UNKNOWN: live Bazos marketplace webhook support]'`.
- `handleWebhook()` reports `Synthetic/internal Bazos order ingested` and returns the unknown live webhook marker.
- Focused order service coverage includes `ingests synthetic/internal webhook envelopes while keeping live Bazos webhook support unknown`.

Provider-backed status proof remains blocked by:

`[UNKNOWN: live Bazos marketplace webhook support]`

`[MISSING: provider-backed Bazos order item/status ingestion contract]`

`[MISSING: Warehouse-owned warehouseId for provider-backed Bazos order items]`

`[MISSING: approved provider-backed non-secret fixture or live provider smoke packet]`

## Handoff

W4 can report source-ready for Bazos buyer/admin lifecycle surfaces: the UI route requests central status, the service attaches central Orders reads, and the frontend renders central lifecycle/delivery states with refresh controls. W4 cannot claim production-complete provider-backed lifecycle proof until the missing buyer/admin auth packets and real provider-backed Bazos webhook/status contract are supplied.

No deploy was performed because this pass changed only validation documentation.
