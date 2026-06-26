# GOAL-17 Bazos Order Forwarding Report

## Intent Compliance Report

### Goal

Make Bazos order forwarding compatible with product-level sales statistics, or produce a bounded blocker when true order ingestion is not implementable in one session.

### Goal Impact

Bazos no longer forwards central Orders payloads with `items: []`. A central order is forwarded only when the incoming Bazos order payload identifies one or more Bazos ad lines that resolve to local `BazosAd.productId`, or when a synthetic/internal payload explicitly carries a canonical `catalogProductId`/`productId`.

### Implemented

- Replaced the empty `items: []` forwarding stub in `OrdersService`.
- Added item mapping from incoming `items`, `orderItems`, `lines`, `products`, top-level ad identifiers, and synthetic/internal `catalogProductId`/`productId` fields.
- Resolved Bazos ad/listing lines through local `BazosAd` by local UUID `adId` or platform `bazosAdId`/`offerId`/`listingId`.
- Forwarded central Orders payloads only with non-empty items containing Catalog product IDs.
- Returned a defensive unavailable forwarding result and left `forwarded` false when item lines are absent, a referenced ad cannot be resolved, or a mapped ad has no Catalog product ID.
- Changed the webhook handler to ingest only synthetic/internal envelopes and report `[UNKNOWN: live Bazos marketplace webhook support]`.
- Added focused service tests proving empty/missing item contracts are not forwarded, mapped ad lines are forwarded with Catalog product IDs, synthetic/internal Catalog product ID payloads forward, and webhook envelopes preserve the live-webhook unknown marker.

### Not Implemented

- True live Bazos marketplace webhook/order ingestion remains blocked because live Bazos webhook support is `[UNKNOWN: live Bazos marketplace webhook support]`.
- No Catalog, Orders, publishing, payment, refund, stock, session, CAPTCHA/SMS, challenge, or deployment changes were made.

### Bazos Compliance Check

Pass by scope. This change does not publish, mutate listings, automate Bazos browser flows, bypass verification, or expose customer data. It only prevents invalid central order forwarding and maps existing local ad metadata when present.

### Validation Evidence

- `NODE_PATH=../../shared/node_modules ../../shared/node_modules/.bin/jest --config jest.config.js src/aukro/orders/orders.service.spec.ts --runInBand`: pass, 1 suite, 5 tests.
- `npm --prefix services/aukro-service run build`: pass.
- `npm --prefix shared run build`: pass.
- `npm test`: pass, 5 suites, 83 tests.
- `git diff --check`: pass.

### Readiness Gate Evidence

- Remote repo preflight on `main`: clean before edits, latest commit `2b1c15a Record client overview statistics deployment`.
- Inspected `BazosOrder` Prisma model: no line-item relation and no Catalog product mapping field.
- Inspected existing forwarding: `services/aukro-service/src/aukro/orders/orders.service.ts` persisted `BazosOrder` then called Orders with `items: []`.
- Inspected Bazos ad schema: `BazosAd.productId` is the local Catalog product ID available for safe mapping.

### Risks

- The service now supports bounded ad-line and synthetic/internal Catalog product ID payload shapes, but actual live Bazos webhook semantics remain `[UNKNOWN: live Bazos marketplace webhook support]`.
- Orders created without item/ad identifiers are stored locally but are not forwarded to central Orders.
- `services/aukro-service/src/aukro/*` paths remain legacy Aukro-named wrappers around Bazos semantics.

### Files Changed

- `services/aukro-service/src/aukro/orders/orders.service.ts`
- `services/aukro-service/src/aukro/orders/orders.service.spec.ts`
- `services/aukro-service/jest.config.js`
- `services/aukro-service/tsconfig.json`
- `implementation-goals/GOAL-17-bazos-order-forwarding.md`
- `reports/validation/GOAL-17-bazos-order-forwarding-report.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`

### Commit Or No-Commit Reason

Commit `5d6b920` created the empty-item forwarding guard. Follow-up commit after final validation records synthetic/internal order payload support.

### Next Action

Rerun Catalog Goal 17 validation against Bazos. True live Bazos marketplace webhook ingestion needs a real Bazos order item ingestion contract before further implementation.

