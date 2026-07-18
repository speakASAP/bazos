const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

function requireIncludes(source, needle, label) {
  assert(source.includes(needle), `${label}: missing ${needle}`);
}

function requireNotIncludes(source, needle, label) {
  assert.equal(source.includes(needle), false, `${label}: must not include ${needle}`);
}

const service = read('services/bazos-service/src/channel/orders/orders.service.ts');
const spec = read('services/bazos-service/src/channel/orders/orders.service.spec.ts');
const w4 = read('reports/validation/2026-07-05-W4-bazos-orders-lifecycle-cabinet-provider-proof.md');
const goal17 = read('reports/validation/GOAL-17-bazos-order-forwarding-report.md');
const report = read('reports/validation/2026-07-05-W8-bazos-provider-proof-gate.md');
const state = read('docs/IMPLEMENTATION_STATE.md');

requireIncludes(service, "const LIVE_BAZOS_WEBHOOK_SUPPORT = '[UNKNOWN: live Bazos marketplace webhook support]'", 'service live webhook marker');
requireIncludes(service, "message: 'Synthetic/internal Bazos order ingested'", 'service synthetic-only webhook message');
requireIncludes(service, "liveWebhookSupport: LIVE_BAZOS_WEBHOOK_SUPPORT", 'service returns unknown marker');
requireIncludes(service, "const BAZOS_ORDER_ITEM_CONTRACT_MISSING = '[MISSING: Bazos order item ingestion contract]'", 'service missing item contract marker');
requireIncludes(service, "const BAZOS_ORDER_WAREHOUSE_ID_MISSING = '[MISSING: Warehouse-owned warehouseId for Bazos order item]'", 'service missing warehouse marker');
requireIncludes(service, 'missing warehouseId: provide Warehouse-owned warehouseId', 'service warehouse fail-closed reason');
requireIncludes(service, 'missing catalogProductId: no Bazos order item lines were provided', 'service missing item fail-closed reason');
requireIncludes(service, 'buildReplayItemSnapshots', 'bounded replay snapshots only');

requireIncludes(spec, 'ingests synthetic/internal webhook envelopes while keeping live Bazos webhook support unknown', 'spec synthetic webhook coverage');
requireIncludes(spec, "liveWebhookSupport: '[UNKNOWN: live Bazos marketplace webhook support]'", 'spec unknown marker expectation');
requireIncludes(spec, 'does not forward when the order has no item/ad line contract', 'spec item contract blocker');
requireIncludes(spec, 'does not forward when the mapped item has no Warehouse-owned warehouseId', 'spec warehouse blocker');
requireIncludes(spec, 'forwards synthetic internal item payloads that already carry Catalog product IDs', 'spec synthetic internal bounded forwarding');

requireIncludes(w4, 'Status: source-verified, runtime buyer/admin smoke gated, provider-backed webhook proof missing', 'W4 source-only status');
requireIncludes(w4, '[UNKNOWN: live Bazos marketplace webhook support]', 'W4 unknown live marker');
requireIncludes(w4, '[MISSING: provider-backed Bazos order item/status ingestion contract]', 'W4 provider item/status blocker');
requireIncludes(w4, '[MISSING: Warehouse-owned warehouseId for provider-backed Bazos order items]', 'W4 provider warehouse blocker');
requireIncludes(w4, '[MISSING: approved provider-backed non-secret fixture or live provider smoke packet]', 'W4 provider fixture blocker');

requireIncludes(goal17, 'True live Bazos marketplace webhook/order ingestion remains blocked', 'Goal 17 provider blocker');
requireIncludes(goal17, 'ingest only synthetic/internal envelopes', 'Goal 17 synthetic-only boundary');
requireIncludes(state, '[RESOLVED: live Bazos paid multi-product order replay evidence]', 'bounded replay source evidence');
requireIncludes(state, 'No customer, address, payment-provider, token, cookie, raw marketplace payload', 'bounded replay sensitive boundary');

requireIncludes(report, 'Vision ->', 'W8 IPS vision marker');
requireIncludes(report, '[UNKNOWN: live Bazos marketplace webhook support]', 'W8 unknown live marker');
requireIncludes(report, '[MISSING: provider-backed Bazos order item/status ingestion contract]', 'W8 item/status blocker');
requireIncludes(report, '[MISSING: approved provider-backed non-secret fixture or live provider smoke packet]', 'W8 fixture blocker');
requireIncludes(report, 'Bounded synthetic/internal evidence is not provider-backed proof', 'W8 bounded proof distinction');
requireNotIncludes(report, 'provider-backed proof complete', 'W8 must not overclaim provider proof');

console.log(JSON.stringify({
  ok: true,
  verifier: 'bazos-provider-proof-gate.v1',
  sourceLifecycleUi: 'verified separately by verify:orders-lifecycle-ui',
  providerBackedProof: 'blocked',
  liveWebhookSupport: '[UNKNOWN: live Bazos marketplace webhook support]',
  runtimeMutation: false,
  sensitiveOutput: 'redacted-source-only',
}, null, 2));
