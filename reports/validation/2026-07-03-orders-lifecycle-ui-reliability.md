# Orders Lifecycle UI Reliability Slice - Bazos

Vision -> Orders is the central lifecycle surface for customer and admin order visibility.
Goal Impact -> Bazos UI keeps central Orders lifecycle labels complete and refreshable for customer and admin order views.
System -> Bazos UI reads local Bazos orders enriched with central Orders read-model fields; Orders remains system of record.
Feature -> Customer and admin order tables show friendly lifecycle labels and existing manual refresh controls.
Task -> Add missing terminal lifecycle label coverage plus a static verifier.
Execution Plan -> Update only the UI asset lifecycle label helper and add a verifier that checks lifecycle and refresh markers.
Coding Prompt -> Worker Frontend-B shared Alfares Orders reliability slice for Allegro, Bazos, and Aukro.
Code -> services/aukro-service/src/ui/ui.assets.ts, scripts/verify-orders-lifecycle-ui.js.
Validation -> node scripts/verify-orders-lifecycle-ui.js passed; cd services/aukro-service && npm run build passed; focused OrdersService jest spec passed 14 tests.

Covered central lifecycle stages: ordered_unpaid, payment_failed, paid_not_delivered, warehouse_fulfillment_requested, warehouse_collecting, warehouse_forming, warehouse_formed, handed_to_delivery, in_delivery, received, not_received, returned, cancelled.

Sensitive-data boundary: validation reports aggregate source coverage only and does not print tokens, customers, order rows, tracking values, provider payloads, or DB rows.

[MISSING: runtime browser smoke after deploy]
[UNKNOWN: whether current production bundle already contains this source change before deploy]
