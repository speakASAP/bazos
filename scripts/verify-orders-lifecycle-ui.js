#!/usr/bin/env node
const fs = require("fs");

const requiredStages = [
  "ordered_unpaid",
  "payment_failed",
  "paid_not_delivered",
  "warehouse_fulfillment_requested",
  "warehouse_collecting",
  "warehouse_forming",
  "warehouse_formed",
  "handed_to_delivery",
  "in_delivery",
  "received",
  "not_received",
  "returned",
  "cancelled",
];

const ui = fs.readFileSync("services/aukro-service/src/ui/ui.assets.ts", "utf8");
const missing = requiredStages.filter((stage) => !ui.includes(stage));
const refreshMarkers = [
  "data-refresh-client",
  "refresh-admin-orders",
  "renderClient()",
  "renderAdmin()",
];
const missingRefresh = refreshMarkers.filter((marker) => !ui.includes(marker));
if (missing.length || missingRefresh.length) {
  console.error(JSON.stringify({
    success: false,
    missingLifecycleStages: missing,
    missingRefreshMarkers: missingRefresh,
  }));
  process.exit(1);
}
console.log(JSON.stringify({
  success: true,
  lifecycleStagesCovered: requiredStages.length,
  refreshCoverage: "manual customer/admin refresh markers present",
}));
