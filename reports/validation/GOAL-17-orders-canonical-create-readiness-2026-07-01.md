# Goal 17 / Orders Goal 7.2B Bazos Canonical Create Readiness

Date: 2026-07-01
Status: deployed; owner-approved synthetic Orders-create smoke passed with Warehouse reservation and cancellation cleanup

## Intent Preservation Chain

- Vision: Orders is the canonical lifecycle and statistics backbone for supported sellable channel orders.
- Goal Impact: Bazos forwards to Orders only when every sellable order item has canonical Catalog and Warehouse ownership identifiers.
- System: `bazos-service` on `alfares:/home/ssf/Documents/Github/bazos-service` owns Bazos-local publishing/session/compliance; `orders-microservice` owns canonical order lifecycle.
- Feature: Bazos canonical Orders create readiness.
- Task: add accepted Orders auth headers and fail closed on missing `warehouseId` before calling Orders.
- Execution Plan: update shared Orders client headers, update Bazos item mapper, add focused specs, run validation gates, update state.
- Coding Prompt: Goal-driven lane Goal 7.2B; remote-only; no Orders repo edits; no raw secrets; no Bazos DB mutation/migration; Auth runtime provisioning only after owner approval.
- Code: `shared/clients/order-client.service.ts`, `shared/clients/order-client.service.spec.ts`, `services/aukro-service/src/aukro/orders/orders.service.ts`, `services/aukro-service/src/aukro/orders/orders.service.spec.ts`, `implementation-goals/GOAL-17-bazos-order-forwarding.md`, `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`.
- Validation: focused Bazos mapper spec pass; focused shared Orders client spec pass; `git diff --check` pass; shared build pass; full shared/root tests pass; service build pass.

## Pre-Coding Readiness Gate

Decision: Accept.

Evidence:

- Remote preflight: `git status --short --branch` returned clean `## main...origin/main`; latest commit `10514ac feat: show catalog content previews for Bazos drafts`.
- Orders contracts read: `CHANNEL_ORDER_CREATE_CONTRACT.md`, `WAREHOUSE_HANDOFF_CONTRACT.md`, `PRODUCTION_ORDER_INTEGRATION_PLAN.md`.
- Bazos required docs read: `AGENTS.md`, `README.md`, `BUSINESS.md`, `SPEC.md`, `SYSTEM.md`, `PLAN.md`, `TASKS.md`, compliance/process/state docs, and Goal 17 report.
- Current code inspection found `OrderClientService` posted without internal service headers and Bazos order items lacked `warehouseId` in forwarded payloads.
- `BazosAd` persists `productId` but no dedicated `warehouseId`; missing route/location evidence must fail closed for Orders create.

## Implemented

- `OrderClientService` now sends `x-service-name: bazos-service` and, when configured, `x-internal-service-token` from runtime env without logging token values.
- The accepted runtime token env lookup supports `BAZOS_INTERNAL_SERVICE_TOKEN`, `ORDERS_INTERNAL_SERVICE_TOKEN`, `ORDER_SERVICE_INTERNAL_TOKEN`, `JWT_TOKEN`, and `SERVICE_TOKEN`; runtime key-name inspection confirmed Bazos currently exposes `JWT_TOKEN`.
- Orders create item typing now includes required `warehouseId`.
- Bazos order forwarding now requires a canonical Catalog `productId` and Warehouse-owned `warehouseId` before calling Orders.
- `warehouseId` can come from the incoming order line or bounded linked-ad policy metadata such as `lastPolicyCheck.draftOptions.warehouseStock.warehouseId`.
- Missing `warehouseId` fails closed before Orders create with `[MISSING: Warehouse-owned warehouseId for Bazos order item]`.
- Existing live webhook blocker remains explicit: `[UNKNOWN: live Bazos marketplace webhook support]`.

## Not Implemented

- No Orders repo edits.
- No Bazos DB mutation or migration. Owner-approved Auth runtime service-principal provisioning and Vault rotation were performed only to unblock Orders-to-Warehouse service auth; no Bazos source or Bazos DB mutation was performed.
- No live Bazos marketplace webhook/order support was implemented because the repo has no provider-backed Bazos marketplace order contract.
- A true provider-backed Bazos marketplace order/webhook implementation remains not implemented; the owner-approved synthetic Orders create smoke was run with synthetic IDs and is recorded below.

## Live Support Evidence

- `services/aukro-service/src/aukro/orders/orders.controller.ts` exposes authenticated `POST /orders` and `POST /orders/webhook` only.
- `OrdersService.handleWebhook` unwraps `order`/`payload`/raw data and returns `Synthetic/internal Bazos order ingested` with `[UNKNOWN: live Bazos marketplace webhook support]`.
- Repo search found no Bazos provider order polling, seller-order endpoint, marketplace order item contract, or external Bazos webhook verifier beyond the synthetic/internal handler.

## Runtime Credential Gate Follow-Up

- Orders repo/read-only scan shows Orders-side Goal 7.2 runtime credential gate deployed in commit `342f003` and `BAZOS_INTERNAL_SERVICE_TOKEN` mapped from `secret/prod/bazos-service#JWT_TOKEN`.
- Bazos live secret key-name inspection shows `JWT_TOKEN` is present in `bazos-service-secret`; no `BAZOS_INTERNAL_SERVICE_TOKEN` key is present on the Bazos caller side.
- Source follow-up added `JWT_TOKEN` / `SERVICE_TOKEN` fallback to the caller header token lookup so Bazos can send the service token that Orders aliases.
- Token values were not decoded, printed, or copied.

## Validation Commands

- `cd services/aukro-service && NODE_PATH=../../shared/node_modules ../../shared/node_modules/.bin/jest --config jest.config.js src/aukro/orders/orders.service.spec.ts --runInBand` - PASS, 1 suite, 7 tests.
- `npm --prefix shared test -- --runTestsByPath clients/order-client.service.spec.ts --runInBand` - PASS, 1 suite, 2 tests.
- `git diff --check` - PASS.
- `npm --prefix shared run build` - PASS.
- `npm --prefix shared test` - PASS, 8 suites, 113 tests.
- `npm test` - PASS, 8 suites, 113 tests.
- `npm --prefix services/aukro-service run build` - PASS.

## Bazos Compliance Check

Pass by scope. The change does not publish, mutate listings, automate Bazos browser flows, bypass verification, alter CAPTCHA/SMS/bank/session/challenge handling, expose raw provider payloads, or mutate Warehouse. It only controls whether already-ingested bounded order payloads may be forwarded to canonical Orders.

## Sensitive Data Check

No raw token values, customer payload dumps, decoded credentials, cookies, payment details, provider payload dumps, or DB data were printed or committed. Tests use synthetic placeholder IDs and a non-secret fake token string.

## Replay And Determinism

Orders create keeps `orders.create.v1` and normalized `channelAccountId` idempotency. Missing `productId` or `warehouseId` returns deterministic unavailable forwarding before the Orders call. Successful synthetic/internal payloads remain retry-compatible through `externalOrderId`, `channel`, and `channelAccountId`.

## Risks And Blockers

- `[UNKNOWN: live Bazos marketplace webhook support]` still blocks true live Bazos order ingestion and live provider smoke.
- Orders-side runtime key-name presence is confirmed: Orders exposes `BAZOS_INTERNAL_SERVICE_TOKEN`, and Bazos exposes `JWT_TOKEN`; token values were not printed.
- Owner-approved synthetic Orders create/reservation smoke passed; no `[MISSING: owner-approved synthetic smoke path]` blocker remains.
- `BazosAd` has no first-class `warehouseId`; durable Warehouse route selection should be made explicit in a future schema/contract if Bazos needs ad-derived Orders forwarding without order-line `warehouseId`.


## Deployment Verification Follow-Up - 2026-07-01

### Intent Preservation Chain

Vision -> Orders remains the canonical lifecycle and statistics backbone for supported sellable channel orders.
Goal Impact -> Bazos can safely call Orders only with accepted service-auth headers and Warehouse-owned item routing identifiers.
System -> `bazos-service` deployed from `alfares:/home/ssf/Documents/Github/bazos-service`; `orders-microservice` remains the canonical order owner.
Feature -> Bazos canonical Orders create caller readiness.
Task -> verify source/runtime readiness, deploy when source was ahead of live image, and run only safe sanitized smoke.
Execution Plan -> inspect remote head/status, verify env-name presence without values, rerun focused and bounded validation, deploy from remote repo, verify rollout and health, preserve live webhook boundary.
Coding Prompt -> delegated Orders Goal 7.2B Bazos lane; remote-only; no Orders edits; no secret values; no production order/customer/payment data; no destructive operations.
Code -> source already complete at `230c6b5`; this follow-up changes documentation/status evidence only.
Validation -> focused specs, shared/root tests, builds, deploy rollout, pod env-name check, and `/health` smoke passed.

### Evidence

- Remote preflight before deployment: `git status --short --branch` returned clean `## main...origin/main`; head `230c6b5 fix: align Bazos Orders auth token runtime fallback`.
- Live deployment before deployment was behind at `localhost:5000/bazos-service:10514ac`; source head was `230c6b5`.
- Runtime env-name check printed names only: `ORDER_SERVICE_URL`, `JWT_TOKEN`, `WAREHOUSE_SERVICE_URL`, and `WAREHOUSE_SERVICE_TOKEN` were present; explicit Orders token aliases were missing, and the code falls back to `JWT_TOKEN`.
- Validation passed: focused Bazos order service spec `1 suite, 7 tests`; focused shared Orders client spec `1 suite, 2 tests`; `git diff --check`; `npm --prefix shared run build`; `npm --prefix shared test` `8 suites, 113 tests`; `npm test` `8 suites, 113 tests`; `npm --prefix services/aukro-service run build`.
- Deployment command: `./scripts/deploy.sh` from the remote repo. Built and pushed `localhost:5000/bazos-service:230c6b5` with digest `sha256:68fb54ffce47bbd4fe319e14929dd62e8425c845a0b8273f440e3ded436e2300`.
- Rollout completed with `deployment/bazos-service` ready `1/1`, updated `1`, available `1`, reasons `MinimumReplicasAvailable` and `NewReplicaSetAvailable`.
- Production smoke: `curl -fsS https://bazos.alfares.cz/health` returned `{"status":"ok","service":"bazos-service"}`.
- Post-approval smoke confirmed current live image remains `localhost:5000/bazos-service:230c6b5`, `/health` returned `status=ok`, runtime env-name check exposes `JWT_TOKEN`, and unauthenticated `GET /orders` returned HTTP 401 `No token provided` without mutating data.

### Smoke Boundary

Before owner approval, mutating Orders-create smoke was held because the synthetic/internal handler can create Bazos and central Orders records. Owner approval is now recorded. The first approved smoke reached Orders through Bazos runtime headers and failed closed at Warehouse reservation handoff; the follow-up fixed the Orders-to-Warehouse runtime credential path and the final approved smoke passed with reservation plus cancellation cleanup. True provider-backed Bazos order ingestion remains `[UNKNOWN: live Bazos marketplace webhook support]`.

### Sensitive Data Check

No raw token values, decoded JWTs, Bazos customer/order payloads, DB rows, production order rows, payment data, or Vault values were printed or changed.


## Owner-Approved Synthetic Orders Create Smoke - 2026-07-01

### Intent Preservation Chain

Vision -> Orders remains the canonical lifecycle and statistics backbone for supported sellable channel orders.
Goal Impact -> Prove the deployed Bazos service-token/header path reaches Orders and Warehouse reservation without using live Bazos provider data.
System -> `bazos-service` pod calls `orders-microservice` inside `statex-apps`; Warehouse remains the required stock/reservation authority; Auth remains service-identity authority.
Feature -> Bazos canonical Orders create runtime smoke.
Task -> run the approved synthetic smoke with fake IDs, one Warehouse-backed item, no customer/payment/provider payload, and sanitized output only; clean up the reservation through the approved Orders cancellation path.
Execution Plan -> verify Bazos API auth behavior, fix the Orders-to-Warehouse runtime credential blocker without Orders source edits from this lane, verify direct Warehouse reserve/cancel, call Orders from the Bazos pod with Bazos service headers, then cancel the synthetic order and verify Warehouse stock returned to zero reserved.
Coding Prompt -> owner-approved follow-up; remote-only; no token values; no Bazos source changes beyond docs; no customer/provider payload dumps; no raw DB rows.
Code -> no Bazos source changes in this follow-up; documentation/status evidence only. External runtime prerequisite: Auth service-principal provisioning and Orders runtime secret rotation were performed without printing token values.
Validation -> Bazos-to-Orders internal auth path accepted; Orders created a Bazos channel order; Warehouse handoff status `reserved`; approved cleanup moved the synthetic order to `cancelled` and Warehouse handoff status `cancelled`; post-cleanup Warehouse read returned `reserved=0` for the fixture.

### Runtime Credential Evidence

- Live Bazos pod remained on `localhost:5000/bazos-service:230c6b5`, ready `1/1`, and `/health` returned `status=ok`.
- Bazos user-facing `/orders` with the pod `JWT_TOKEN` returned HTTP 401, so the browser/user-facing route is not a safe internal service-token smoke path.
- Orders initially exposed `WAREHOUSE_SERVICE_TOKEN`, but Warehouse returned HTTP 401 for protected reads; the owner-approved follow-up created Auth service principal `orders-warehouse-service@internal.alfares.local` with role `internal:warehouse-microservice:admin` and wrote an Auth-compatible JWT to Vault key `secret/prod/orders-microservice#WAREHOUSE_SERVICE_TOKEN` without printing the value.
- The first Vault write included a trailing newline, which Axios rejected as `ERR_INVALID_CHAR` in the `Authorization` header; the token was reissued without newline, ExternalSecret sync was forced, and Orders was restarted.
- Orders live deployment is now `localhost:5000/orders-microservice:43f9774`; the Orders repo is ahead of origin with `43f9774 fix: trim warehouse reservation token`. This is recorded as an external Orders runtime prerequisite, not a Bazos source change.
- Direct Axios-equivalent reserve/cancel from the Orders pod against Warehouse succeeded for synthetic product `884c1c5e-fe94-46c7-aab1-78bcc424e7ee` in warehouse `c0de0000-0000-4000-8000-000000000013`: reserve returned HTTP 201 and `reserved=1`; cancel returned HTTP 201 and `reserved=0`.

### Final Smoke Evidence

- Synthetic Orders create was executed from inside the Bazos pod against `http://orders-microservice:3203/api/orders` with headers `x-service-name: bazos-service` and `x-internal-service-token` sourced from Bazos runtime env.
- Payload used only synthetic identifiers, one item with canonical Catalog `productId` `884c1c5e-fe94-46c7-aab1-78bcc424e7ee`, Warehouse `warehouseId` `c0de0000-0000-4000-8000-000000000013`, CZK totals, no customer fields, no address fields, and no provider/payment data.
- Orders response returned HTTP 201, `success=true`, channel `bazos`, external order `codex-bazos-reservation-20260701083720`, order `e4845f9c-5a68-466d-9fe2-cec32643ab65`, one item, and warehouse handoff `{status: reserved, itemCount: 1, reservedCount: 1, failedCount: 0, reasonCode: ORDER_CREATE_RESERVATION}`.
- Approved cleanup through `OrdersService.updateStatus(..., cancelled, approval)` returned order status `cancelled` and warehouse handoff `{status: cancelled, itemCount: 1, reservedCount: 1, failedCount: 0, reasonCode: ORDER_CANCELLED}`.
- Post-cleanup Warehouse read for the fixture returned HTTP 200 with `quantity=60`, `reserved=0`, and `available=60`.

### Outcome

- PASS: Bazos deployed runtime token/header path is accepted by Orders.
- PASS: Canonical Orders create for synthetic Bazos channel payload succeeds when every item has canonical `productId` and Warehouse-owned `warehouseId`.
- PASS: Warehouse reservation and owner-approved cancellation cleanup both succeeded without leaking token values or customer/provider data.
- PRESERVED: True live Bazos marketplace webhook support remains `[UNKNOWN: live Bazos marketplace webhook support]`.

### Sensitive Data Check

No raw tokens, decoded JWTs, live Bazos customer/order payloads, DB row dumps, production customer rows, payment data, Vault values, or Warehouse response bodies beyond bounded synthetic stock counters were printed.

## Files Changed

- `shared/clients/order-client.service.ts`
- `shared/clients/order-client.service.spec.ts`
- `services/aukro-service/src/aukro/orders/orders.service.ts`
- `services/aukro-service/src/aukro/orders/orders.service.spec.ts`
- `implementation-goals/GOAL-17-bazos-order-forwarding.md`
- `reports/validation/GOAL-17-orders-canonical-create-readiness-2026-07-01.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`

## Commit Or No-Commit Reason

Source commits `70e5571` and `230c6b5` were created and pushed. Deployment/status evidence and owner-approved synthetic smoke evidence were recorded in docs commits; final commit SHA is recorded in the session response.

## Next Action

Implement or provide a real Bazos live marketplace order/webhook contract before claiming provider-backed live Bazos order ingestion. Keep Orders runtime prerequisite `43f9774`/Warehouse service-token rotation tracked in the Orders lane until pushed/settled.
