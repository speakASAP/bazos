#!/usr/bin/env node
const fs = require("fs");

const files = {
  packet: "docs/orchestrator/2026-07-06-w8-bazos-product-decision-intake-packet.md",
  report: "reports/validation/2026-07-06-W8-bazos-product-decision-intake.md",
  runtimeHandoff: "docs/orchestrator/2026-07-05-runtime-gate-packet-handoff.md",
  providerGate: "reports/validation/2026-07-05-W8-bazos-provider-proof-gate.md",
  providerBoundary: "reports/validation/2026-07-05-W8-bazos-provider-backed-order-lifecycle-proof-blocker.md",
};
const allowedOptions = [
  "provider_backed_supported",
  "provider_backed_not_supported",
  "provider_backed_out_of_scope",
  "bounded_synthetic_accepted_for_now",
];
const requiredMarkers = [
  "[UNKNOWN: live Bazos marketplace webhook support]",
  "[MISSING: approved provider-backed non-secret fixture or live provider smoke packet]",
  "[MISSING: provider-backed Bazos order item/status ingestion contract]",
  "[MISSING: provider-backed Bazos order status transition sample]",
  "[MISSING: provider-backed Bazos order item identity mapping sample]",
  "[MISSING: Warehouse-owned warehouseId for provider-backed Bazos order items]",
  "bounded_synthetic_accepted_for_now",
];
function read(path) {
  return fs.readFileSync(path, "utf8");
}
function requireIncludes(label, content, markers) {
  return markers.filter((marker) => !content.includes(marker)).map((marker) => ({ label, missing: marker }));
}
function yamlAllowedOptions(content) {
  const anchor = "allowed_options:\n";
  const start = content.indexOf(anchor);
  if (start === -1) return [];
  const lines = content.slice(start + anchor.length).split("\n");
  const out = [];
  for (const line of lines) {
    if (!line.startsWith("  - ")) break;
    out.push(line.slice(4).trim());
  }
  return out;
}
const packet = read(files.packet);
const report = read(files.report);
const runtimeHandoff = read(files.runtimeHandoff);
const providerGate = read(files.providerGate);
const providerBoundary = read(files.providerBoundary);
const combined = [packet, report, runtimeHandoff, providerGate, providerBoundary].join("\n");
const failures = [
  ...requireIncludes(files.packet, packet, [
    "Vision ->",
    "Goal Impact ->",
    "System ->",
    "Feature ->",
    "Task ->",
    "Execution Plan ->",
    "Coding Prompt ->",
    "Code ->",
    "Validation ->",
    "Exactly one product decision option is now recorded for the current release",
  ]),
  ...requireIncludes(files.report, report, [
    "Vision ->",
    "Goal Impact ->",
    "System ->",
    "Feature ->",
    "Task ->",
    "Execution Plan ->",
    "Coding Prompt ->",
    "Code ->",
    "Validation ->",
    "selected option is `bounded_synthetic_accepted_for_now`",
  ]),
  ...requireIncludes("combined W8 artifacts", combined, requiredMarkers),
];
const optionsInYaml = yamlAllowedOptions(packet);
if (JSON.stringify(optionsInYaml) !== JSON.stringify(allowedOptions)) {
  failures.push({ label: files.packet, invalidAllowedOptions: optionsInYaml, expectedAllowedOptions: allowedOptions });
}
const selectedMatches = [...combined.matchAll(/selected_option:\s*"?([a-z_]+|\[MISSING:[^\]\n]+\])"?/g)].map((m) => m[1]);
const concreteSelections = [...new Set(selectedMatches.filter((value) => allowedOptions.includes(value)))];
if (concreteSelections.length !== 1) {
  failures.push({ label: "decision selection", message: "Exactly one concrete selection must be recorded.", concreteSelections });
}
if (concreteSelections[0] !== "bounded_synthetic_accepted_for_now") {
  failures.push({ label: "decision selection", message: "Current release must record bounded_synthetic_accepted_for_now.", concreteSelections });
}
if (packet.includes("[MISSING: Bazos owner must select exactly one allowed product decision option]") || report.includes("[MISSING: Bazos owner must select exactly one allowed product decision option]")) {
  failures.push({ label: "decision selection", message: "Owner-decision missing marker must be cleared from current packet/report after recording the scope decision." });
}
for (const pattern of [
  /provider-backed proof complete/i,
  /provider-backed proof verified/i,
  /provider-backed proof resolved/i,
  /provider-backed proof passed/i,
  /live bazos marketplace webhook support resolved/i,
]) {
  for (const [path, content] of Object.entries({ [files.packet]: packet, [files.report]: report })) {
    const match = content.match(pattern);
    if (match) failures.push({ label: path, forbiddenOverclaim: match[0] });
  }
}
const result = {
  success: failures.length === 0,
  verifier: "bazos-product-decision-intake.v2",
  providerBackedProof: "unclaimed_future_product_gated",
  selectedOption: concreteSelections[0] || null,
  allowedOptions,
  preservedUnknown: "[UNKNOWN: live Bazos marketplace webhook support]",
  checkedFiles: Object.values(files),
  failures,
};
if (failures.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(result, null, 2));
