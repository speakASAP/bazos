#!/usr/bin/env node
const fs = require("fs");

const files = {
  service: "services/bazos-service/src/channel/orders/orders.service.ts",
  spec: "services/bazos-service/src/channel/orders/orders.service.spec.ts",
  controller: "services/bazos-service/src/channel/orders/orders.controller.ts",
  w4Report: "reports/validation/2026-07-05-W4-bazos-orders-lifecycle-cabinet-provider-proof.md",
  w8Report: "reports/validation/2026-07-05-W8-bazos-provider-backed-order-lifecycle-proof-blocker.md",
};

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireIncludes(label, content, markers) {
  return markers
    .filter((marker) => !content.includes(marker))
    .map((marker) => ({ label, missing: marker }));
}

const service = read(files.service);
const spec = read(files.spec);
const controller = read(files.controller);
const w4Report = read(files.w4Report);
const w8Report = read(files.w8Report);
const combinedReport = `${w4Report}\n${w8Report}`;

const failures = [
  ...requireIncludes(files.service, service, [
    "const LIVE_BAZOS_WEBHOOK_SUPPORT = '[UNKNOWN: live Bazos marketplace webhook support]'",
    "Synthetic/internal Bazos order ingested",
    "liveWebhookSupport: LIVE_BAZOS_WEBHOOK_SUPPORT",
  ]),
  ...requireIncludes(files.spec, spec, [
    "ingests synthetic/internal webhook envelopes while keeping live Bazos webhook support unknown",
    "liveWebhookSupport: '[UNKNOWN: live Bazos marketplace webhook support]'",
  ]),
  ...requireIncludes(files.controller, controller, [
    "@UseGuards(JwtAuthGuard)",
    "@Post('webhook')",
  ]),
  ...requireIncludes("provider proof reports", combinedReport, [
    "Status: source/UI proof accepted; provider-backed proof blocked",
    "[UNKNOWN: live Bazos marketplace webhook support]",
    "[MISSING: provider-backed Bazos order item/status ingestion contract]",
    "[MISSING: provider-backed Bazos order status transition sample]",
    "[MISSING: provider-backed Bazos order item identity mapping sample]",
    "[MISSING: Warehouse-owned warehouseId for provider-backed Bazos order items]",
    "[MISSING: approved provider-backed non-secret fixture or live provider smoke packet]",
  ]),
];

const unsupportedClaimPatterns = [
  /\bprovider-backed\b.{0,80}\b(resolved|complete|passed|proven|verified|production-ready)\b/i,
  /\blive Bazos marketplace webhook\b.{0,80}\b(resolved|complete|passed|proven|verified|production-ready)\b/i,
  /\breal provider\b.{0,80}\b(resolved|complete|passed|proven|verified|production-ready)\b/i,
];

for (const [path, content] of Object.entries({ [files.w4Report]: w4Report, [files.w8Report]: w8Report })) {
  for (const pattern of unsupportedClaimPatterns) {
    const match = content.match(pattern);
    const contextBefore = content.slice(Math.max(0, match?.index - 160), match?.index);
    const matchedText = match ? match[0] : "";
    const isNegativeBoundary = contextBefore.includes("cannot claim")
      || /\bnot\s+(resolved|complete|passed|proven|verified|production-ready)\b/i.test(matchedText)
      || /\bno\s+real\b/i.test(contextBefore);
    if (match && !isNegativeBoundary) {
      failures.push({ label: path, forbiddenClaim: match[0] });
    }
  }
}

const result = {
  success: failures.length === 0,
  providerBackedProof: "blocked",
  sourceUiProof: "accepted",
  guardedBoundary: "synthetic/internal Bazos order ingestion is not provider-backed webhook/status proof",
  checkedFiles: Object.values(files),
  requiredMissingPacketFields: [
    "live Bazos marketplace webhook support",
    "provider-backed Bazos order item/status ingestion contract",
    "provider-backed Bazos order status transition sample",
    "provider-backed Bazos order item identity mapping sample",
    "Warehouse-owned warehouseId for provider-backed Bazos order items",
    "approved provider-backed non-secret fixture or live provider smoke packet",
  ],
  failures,
};

if (failures.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));
