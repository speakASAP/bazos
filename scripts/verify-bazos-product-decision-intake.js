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
  "[MISSING: Bazos owner must select exactly one allowed product decision option]",
];

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireIncludes(label, content, markers) {
  return markers
    .filter((marker) => !content.includes(marker))
    .map((marker) => ({ label, missing: marker }));
}

function yamlAllowedOptions(content) {
  const match = content.match(/allowed_options:\n((?:  - [a-z_]+\n?)+)/);
  if (!match) {
    return [];
  }
  return match[1]
    .trim()
    .split(/\n/)
    .map((line) => line.replace(/^-\s+|^\s+-\s+/, "").trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

const packet = read(files.packet);
const report = read(files.report);
const runtimeHandoff = read(files.runtimeHandoff);
const providerGate = read(files.providerGate);
const providerBoundary = read(files.providerBoundary);
const combinedNew = `${packet}\n${report}`;
const combinedExisting = `${runtimeHandoff}\n${providerGate}\n${providerBoundary}`;

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
    "Bazos owner must select exactly one product decision option",
    "Provider-backed proof is blocked until one allowed product option is owner-selected",
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
    "The verifier requires this exact option set",
  ]),
  ...requireIncludes("new intake artifacts", combinedNew, requiredMarkers),
  ...requireIncludes("existing W8 artifacts", combinedExisting, [
    "[UNKNOWN: live Bazos marketplace webhook support]",
    "[MISSING: approved provider-backed non-secret fixture or live provider smoke packet]",
    "[MISSING: provider-backed Bazos order item/status ingestion contract]",
    "Provider support is unknown and no product decision exists.",
  ]),
];

const optionsInYaml = yamlAllowedOptions(packet);
if (JSON.stringify(optionsInYaml) !== JSON.stringify(allowedOptions)) {
  failures.push({
    label: files.packet,
    invalidAllowedOptions: optionsInYaml,
    expectedAllowedOptions: allowedOptions,
  });
}

const optionOccurrences = allowedOptions.map((option) => ({
  option,
  packetOccurrences: (packet.match(new RegExp(`\\b${option}\\b`, "g")) || []).length,
  reportOccurrences: (report.match(new RegExp(`\\b${option}\\b`, "g")) || []).length,
}));

for (const occurrence of optionOccurrences) {
  if (occurrence.packetOccurrences < 2 || occurrence.reportOccurrences < 1) {
    failures.push({ label: "allowed option coverage", ...occurrence });
  }
}

const selectedOptionMatches = [...combinedNew.matchAll(/selected_option:\s*"?([a-z_]+|\[MISSING:[^\]\n]+\])"?/g)].map((match) => match[1]);
const concreteSelections = selectedOptionMatches.filter((value) => allowedOptions.includes(value));
const invalidConcreteSelections = selectedOptionMatches.filter((value) => !allowedOptions.includes(value) && !value.startsWith("[MISSING:"));

if (unique(concreteSelections).length > 1 || concreteSelections.length > 1) {
  failures.push({
    label: "decision selection",
    message: "Only one product decision option may be selected.",
    selectedOptions: concreteSelections,
  });
}

if (invalidConcreteSelections.length) {
  failures.push({
    label: "decision selection",
    message: "Selected option must be one of the allowed values or an explicit missing marker.",
    invalidConcreteSelections,
  });
}

if (concreteSelections.length === 0 && !combinedNew.includes("[MISSING: Bazos owner must select exactly one allowed product decision option]")) {
  failures.push({
    label: "decision selection",
    message: "No selected decision option and no missing owner-decision marker found.",
  });
}

const forbiddenCompletionPatterns = [
  /\bprovider-backed proof complete\b/i,
  /\bprovider-backed proof verified\b/i,
  /\bprovider-backed proof resolved\b/i,
  /\bprovider-backed proof passed\b/i,
  /\bprovider-backed proof production-ready\b/i,
  /\bprovider-backed marketplace proof complete\b/i,
];

for (const [path, content] of Object.entries({ [files.packet]: packet, [files.report]: report })) {
  for (const pattern of forbiddenCompletionPatterns) {
    const match = content.match(pattern);
    if (match) {
      failures.push({ label: path, forbiddenOverclaim: match[0] });
    }
  }
}

const sensitivePatterns = [
  /\bBearer\s+[A-Za-z0-9._-]+/i,
  /\beyJ[A-Za-z0-9._-]+/,
  /\b(token|cookie|password|secret)\s*[:=]\s*['"]?[A-Za-z0-9._-]{12,}/i,
  /\b(customer|payment|tracking|provider)\s*id\s*[:=]\s*['"]?[A-Za-z0-9._-]{6,}/i,
];

for (const [path, content] of Object.entries({ [files.packet]: packet, [files.report]: report })) {
  for (const pattern of sensitivePatterns) {
    const match = content.match(pattern);
    if (match) {
      failures.push({ label: path, sensitiveDataPattern: match[0] });
    }
  }
}

const result = {
  success: failures.length === 0,
  verifier: "bazos-product-decision-intake.v1",
  providerBackedProof: "blocked",
  selectedOption: concreteSelections[0] || "[MISSING: Bazos owner must select exactly one allowed product decision option]",
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
