# W8 Bazos Provider-Backed Order Lifecycle Proof Blocker

Date: 2026-07-05
Repo: `/home/ssf/Documents/Github/bazos`
Workstream: W8 Bazos provider-backed order lifecycle proof
Status: source/UI proof accepted; provider-backed proof blocked

## Intent Preservation Chain

Vision -> Every sellable order is error-free and every customer/admin cabinet reflects the canonical Orders lifecycle.

Goal Impact -> Bazos order lifecycle claims remain accurate: source/UI central Orders read-model proof is accepted, while real provider-backed webhook/status proof is not claimed without provider evidence.

System -> Orders owns canonical order lifecycle; Warehouse owns stock/reservation/fulfillment/delivery status; Bazos owns channel ingestion, synthetic/internal forwarding, and UI/read-model projection only.

Feature -> Bazos provider-backed order lifecycle evidence gate for the Unified Order Lifecycle Platform.

Task -> Close as much as safely possible of `[MISSING: Bazos provider webhook/status contract sample]` without live provider calls, DB mutation, token/session output, provider payload invention, deploy, or broad source rewrites.

Execution Plan -> Inspect remote state, current W4 lifecycle proof, Bazos order webhook/status source, provider-related reports, and existing verifier; because no real provider contract/sample exists, add a guard verifier and explicit blocker report with exact missing packet fields.

Coding Prompt -> Remote-only W8 Bazos provider-backed proof lane; allowed docs/reports/verifier scripts and narrowly scoped source/verifier files; forbidden live provider calls, customer/payment/token output, DB mutation, deploy, broad schema rewrites, invented webhook payloads.

Code -> Added `scripts/verify-bazos-provider-proof-boundary.js`. No runtime source, schema, deploy, or provider integration code changed.

Validation -> See command evidence below.

## Artifact Validated

- `reports/validation/2026-07-05-W4-bazos-orders-lifecycle-cabinet-provider-proof.md`
- `services/bazos-service/src/channel/orders/orders.service.ts`
- `services/bazos-service/src/channel/orders/orders.controller.ts`
- `services/bazos-service/src/channel/orders/orders.service.spec.ts`
- `scripts/verify-orders-lifecycle-ui.js`
- `scripts/verify-bazos-provider-proof-boundary.js`

## Validation Scope

This report validates the boundary between source/UI lifecycle proof and real provider-backed Bazos webhook/status evidence.

Accepted evidence:

- Bazos buyer/admin UI source renders central Orders lifecycle/status fields and refresh controls.
- Bazos order reads can attach central Orders lifecycle status from stored central order ids.
- Bazos synthetic/internal order ingestion can forward bounded item payloads when Catalog product and Warehouse-owned `warehouseId` evidence exists.

Rejected as provider-backed proof:

- Synthetic/internal webhook envelopes.
- Source-only UI coverage.
- Orders lifecycle read-model coverage over already stored central order ids.
- Runtime health or unauthenticated guard smoke.
- Paid replay/source projection evidence that is not a Bazos provider webhook/status packet.

## Gate Evidence

Remote preflight on 2026-07-05:

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && pwd && git status --short --branch && git log -1 --oneline && git log --oneline --decorate --max-count=8'
/home/ssf/Documents/Github/bazos
## main...origin/main
f808037 docs: add W4 Bazos orders lifecycle proof
f808037 (HEAD -> main, origin/main) docs: add W4 Bazos orders lifecycle proof
6a4690d docs: plan error-free orders lifecycle
053a4d3 chore: expose orders lifecycle ui verifier
```

Source findings:

- `services/bazos-service/src/channel/orders/orders.service.ts` keeps `LIVE_BAZOS_WEBHOOK_SUPPORT = '[UNKNOWN: live Bazos marketplace webhook support]'`.
- `OrdersService.handleWebhook()` unwraps `order`/`payload`/raw data and returns `Synthetic/internal Bazos order ingested`, so the handler is not a real provider webhook contract.
- `services/bazos-service/src/channel/orders/orders.service.spec.ts` explicitly tests `ingests synthetic/internal webhook envelopes while keeping live Bazos webhook support unknown`.
- `services/bazos-service/src/channel/orders/orders.controller.ts` exposes guarded `POST /orders/webhook`; this does not establish a Bazos provider payload/status contract.
- Repo search found no non-secret Bazos provider order webhook fixture, provider status transition sample, provider order item identity mapping sample, or live provider smoke packet.

## Contract Evidence

Provider-backed proof remains blocked by the following exact missing packet fields:

- `[UNKNOWN: live Bazos marketplace webhook support]`
- `[MISSING: provider-backed Bazos order item/status ingestion contract]`
- `[MISSING: provider-backed Bazos order status transition sample]`
- `[MISSING: provider-backed Bazos order item identity mapping sample]`
- `[MISSING: Warehouse-owned warehouseId for provider-backed Bazos order items]`
- `[MISSING: approved provider-backed non-secret fixture or live provider smoke packet]`

Minimum acceptable future packet:

- Provider source: documented Bazos provider/order source name and whether it is webhook, poll, export, manual callback, or approved simulator.
- Auth boundary: non-secret proof of the accepted auth/session/service boundary; no raw token, cookie, customer, payment, or private provider payload values.
- Status contract: allowed provider status values and their mapping to Orders lifecycle/payment/fulfillment/delivery fields.
- Item identity: one non-secret item sample showing how provider item/ad/listing ids map to Catalog `productId`.
- Warehouse identity: Warehouse-owned `warehouseId` source for each order item before central Orders forwarding.
- Evidence mode: fixture path, sanitizer description, or approved live-smoke run id with aggregate-only results.

## Invariant Evidence

- No Bazos publishing, scraping, provider polling, challenge bypass, browser automation, provider call, or production deployment was performed.
- No customer, payment, token, cookie, address, raw provider payload, or marketplace private identifier was recorded.
- The verifier fails closed when proof reports omit the provider-backed missing packet fields or claim provider-backed completion without the required boundary language.

## Sensitive-Data Scan Evidence

The new report and verifier contain only aggregate source filenames, status labels, and `[MISSING: ...]` / `[UNKNOWN: ...]` markers. They do not contain bearer values, cookies, customer data, payment details, addresses, raw provider payloads, or provider tracking values.

## Replay And Determinism Evidence

`scripts/verify-bazos-provider-proof-boundary.js` is deterministic static validation over repository files. It does not call remote services or mutate state.

## Commands Run

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && npm run verify:orders-lifecycle-ui'

> bazos-service@1.0.0 verify:orders-lifecycle-ui
> node scripts/verify-orders-lifecycle-ui.js

{"success":true,"lifecycleStagesCovered":13,"refreshCoverage":"manual customer/admin refresh markers present"}
```

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && node scripts/verify-bazos-provider-proof-boundary.js'
{
  "success": true,
  "providerBackedProof": "blocked",
  "sourceUiProof": "accepted",
  "guardedBoundary": "synthetic/internal Bazos order ingestion is not provider-backed webhook/status proof",
  "requiredMissingPacketFields": [
    "live Bazos marketplace webhook support",
    "provider-backed Bazos order item/status ingestion contract",
    "provider-backed Bazos order status transition sample",
    "provider-backed Bazos order item identity mapping sample",
    "Warehouse-owned warehouseId for provider-backed Bazos order items",
    "approved provider-backed non-secret fixture or live provider smoke packet"
  ],
  "failures": []
}
```

```text
ssh alfares 'cd /home/ssf/Documents/Github/bazos && git diff --check'
pass, no output
```

## Passed Criteria

- Source/UI proof remains distinguished from provider-backed proof.
- Missing provider packet fields are explicit and machine-checked.
- The verifier guards against replacing a real provider packet with synthetic/internal source-only evidence.

## Failed Criteria

- Provider-backed Bazos lifecycle proof is not complete.
- No real Bazos provider webhook/status contract sample was found.
- No approved provider-backed non-secret fixture or live provider smoke packet was available.

## Deviations

No live provider calls, DB mutation, deploy, or Orders repo update were performed. The Orders cross-repo report was not created because Bazos provider-backed proof remains blocked, so cross-repo evidence would only duplicate a Bazos-local blocker.

## Validation Results

- `npm run verify:bazos-provider-proof-gate` - PASS.
- `npm run verify:bazos-provider-proof-boundary` - PASS.
- `npm run verify:orders-lifecycle-ui` - PASS, 13 lifecycle stages and manual customer/admin refresh markers.
- `git diff --check` - PASS.

## Recommendation

Keep Bazos W8 open as provider-blocked until an owner-approved non-secret provider/status packet is supplied. Treat the existing W4 proof as source/UI read-model proof only.

## Next Action

Provider/integration owner should supply the minimum acceptable future packet listed above, or explicitly decide that Bazos has no provider-backed order lifecycle source and update the Unified Order Lifecycle Platform acceptance criteria accordingly.
