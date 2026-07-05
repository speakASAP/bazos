# W8 Bazos Provider Proof Gate

Date: 2026-07-05
Repo: `/home/ssf/Documents/Github/bazos`
Status: source-gate-added-provider-backed-proof-blocked

## Intent Preservation Chain

Vision -> Every sellable order is error-free and every marketplace cabinet reflects canonical Orders lifecycle without pretending synthetic/internal data is provider-backed marketplace evidence.

Goal Impact -> Bazos remains source-verified for central Orders lifecycle UI, while provider-backed webhook/status proof is explicitly blocked until a real non-secret provider contract/sample or approved live fixture exists.

System -> Orders owns canonical lifecycle and Warehouse handoff; Warehouse owns stock/reservation/fulfillment; Bazos owns channel-local ingestion, UI projection, synthetic/internal replay source, and proof boundaries; external Bazos/provider systems own any real marketplace webhook semantics.

Feature -> Provider-proof gate for Bazos order lifecycle evidence.

Task -> Close the unsafe ambiguity in `[MISSING: Bazos provider webhook/status contract sample]` by verifying the current source boundary and preventing source-only lifecycle proof from being reported as provider-backed proof.

Execution Plan -> Inspect Bazos order ingestion/forwarding source, existing W4/Goal17 reports and implementation state; add a static verifier that checks live webhook support remains unknown, synthetic/internal support is bounded, provider-backed blockers are explicit, and no live/provider mutation occurred.

Coding Prompt -> Do not invent Bazos provider webhook payloads, do not call live providers, do not print customer/payment/token data, and do not mutate DB/runtime. Document exact missing evidence instead.

Code -> `scripts/verify-bazos-provider-proof-gate.js`, `package.json`, and this report.

Validation -> `npm run verify:bazos-provider-proof-gate`, `npm run verify:orders-lifecycle-ui`, `git diff --check`.

## Current Evidence

- `services/aukro-service/src/aukro/orders/orders.service.ts` keeps `LIVE_BAZOS_WEBHOOK_SUPPORT = '[UNKNOWN: live Bazos marketplace webhook support]'`.
- `handleWebhook()` returns `message: 'Synthetic/internal Bazos order ingested'` and echoes the unknown live-webhook marker.
- The order service fails closed when provider/order payloads lack a Bazos item/ad line contract: `[MISSING: Bazos order item ingestion contract]`.
- The order service fails closed when mapped items lack Warehouse-owned routing: `[MISSING: Warehouse-owned warehouseId for Bazos order item]`.
- Focused specs cover synthetic/internal webhook envelopes, missing item contracts, missing Warehouse IDs, ad-line mapping, and synthetic/internal Catalog product payloads.
- W4 report proves customer/admin lifecycle surfaces source-read central Orders lifecycle, but it explicitly marks provider-backed webhook proof missing.
- Goal 24/implementation state contains bounded paid multi-product replay evidence, but that evidence is synthetic/internal and excludes customer, address, payment-provider, token, cookie, raw marketplace payload, Bazos verification data, Orders create, Warehouse reservation, Catalog publish, and marketplace publication.

## Provider-Backed Proof Status

Provider-backed Bazos lifecycle proof is blocked, not complete. Bounded synthetic/internal evidence is not provider-backed proof.

Remaining provider-backed gates:

- `[UNKNOWN: live Bazos marketplace webhook support]`
- `[MISSING: provider-backed Bazos order item/status ingestion contract]`
- `[MISSING: Warehouse-owned warehouseId for provider-backed Bazos order items]`
- `[MISSING: approved provider-backed non-secret fixture or live provider smoke packet]`
- `[MISSING: approved live Bazos buyer bearer/session packet for /ui/orders customer cabinet smoke]`
- `[MISSING: approved live Bazos admin bearer/session packet for /ui/orders?scope=admin cabinet smoke]`

## Parallel Execution

| Workstream | Status | Owner role | Objective | Dependencies/blockers | Validation evidence | Handoff notes |
|---|---|---|---|---|---|---|
| W8-A Source provider gate | complete-source-validated | Bazos validation owner | Prevent overclaiming synthetic/internal evidence as provider-backed proof | none | `verify:bazos-provider-proof-gate` | Commit report/verifier only |
| W8-B Real provider contract/sample | blocked | Bazos/provider owner | Supply real provider webhook/status contract or non-secret sample | `[UNKNOWN: live Bazos marketplace webhook support]`, `[MISSING: provider-backed Bazos order item/status ingestion contract]` | future provider contract verifier | Must redact provider/customer/payment data |
| W8-C Live Bazos buyer/admin proof | blocked | Validation owner | Browser/API cabinet proof backed by approved session and eligible row | `[MISSING: approved live Bazos buyer/admin bearer/session packet]` | sanitized smoke report | No token/session output |

## Validation Results

- `npm run verify:bazos-provider-proof-gate` - PASS.
- `npm run verify:bazos-provider-proof-boundary` - PASS.
- `npm run verify:orders-lifecycle-ui` - PASS, 13 lifecycle stages and manual customer/admin refresh markers.
- `git diff --check` - PASS.

## Deployment

Not run. This lane changed verifier/report metadata only and did not invoke production providers, DB writes, Orders create, Warehouse mutation, payment, deployment, or browser sessions.
