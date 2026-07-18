const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const requiredFiles = [
  'services/bazos-service/src/business-health/business-health.controller.ts',
  'services/bazos-service/src/business-health/business-health.module.ts',
  'services/bazos-service/src/business-health/business-health.service.ts',
  'services/bazos-service/src/business-health/business-health.types.ts',
  'services/bazos-service/src/app.module.ts',
  'docs/orchestrator/2026-07-06-bazos-business-health-handoff.md',
  'implementation-goals/GOAL-26-bazos-business-health-channel-readback.md',
  'reports/validation/2026-07-06-bazos-business-health-channel-readback.md',
];

const requiredSnippets = {
  'services/bazos-service/src/business-health/business-health.controller.ts': [
    "@Controller('bazos/business-health')",
    "@Get('channel-readback')",
    'getChannelReadback',
  ],
  'services/bazos-service/src/business-health/business-health.service.ts': [
    "const CONTRACT_ID = 'bazos.channel_readback_business_health.v1' as const;",
    "const BUSINESS_HEALTH_CONTRACT = 'stock-order-marketplace-business-health.v1' as const;",
    "const ENDPOINT = '/bazos/business-health/channel-readback' as const;",
    "status: 'warn'",
    "evidenceMode: 'source-only'",
    'listingQuantityMustNotExceedWarehouseAvailability: true',
    'listingMustNotRemainSellableWhenCatalogUnavailable: true',
    'externalReadbackRequiredBeforeRuntimePass: true',
    'providerBackedOrderReadbackRequiredBeforeRuntimePass: true',
    'bazosVerificationAndChallengeControlsMustNotBeBypassed: true',
    'runtimeDataQueried: false',
    'productionDbQueried: false',
    'liveSyntheticMutationAuthorized: false',
    'externalMarketplaceReadQueried: false',
    'externalMarketplaceMutationAuthorized: false',
    'importOrSyncAuthorized: false',
    'orderIngestionAuthorized: false',
    'localAdMutationAuthorized: false',
    'warehouseQueried: false',
    'catalogQueried: false',
    'ordersQueried: false',
    'mutatesBazos: false',
    'mutatesMarketplaceListing: false',
    'mutatesLocalAd: false',
    'mutatesWarehouse: false',
    'mutatesCatalog: false',
    'mutatesOrders: false',
    'mutatesPayments: false',
    'changesSecretsOrEnv: false',
    '[MISSING: approved live Bazos readback packet]',
    '[MISSING: target product/listing/account for Bazos channel readback proof]',
    '[UNKNOWN: live Bazos marketplace webhook support]',
    '[MISSING: provider-backed Bazos order item/status ingestion contract]',
    '[MISSING: owner-approved Bazos external delete/de-list capability]',
    'shared/bazos/reconciliation/bazos-availability-reconciliation.service.ts',
    'shared/bazos/catalog/bazos-catalog-sell-action.service.ts',
    'shared/bazos/policy/publish-policy.service.ts',
    'shared/rabbitmq/stock-events.subscriber.ts',
    'services/bazos-service/src/channel/orders/orders.service.ts',
    'docs/BAZOS_COMPLIANCE.md',
    'docs/orchestrator/2026-07-05-runtime-gate-packet-handoff.md',
    'reports/validation/2026-07-05-W8-bazos-provider-proof-gate.md',
  ],
  'services/bazos-service/src/business-health/business-health.types.ts': [
    'BazosChannelReadbackBusinessHealthEnvelope',
    "contractId: 'bazos.channel_readback_business_health.v1'",
    "businessHealthContract: 'stock-order-marketplace-business-health.v1'",
    "endpoint: '/bazos/business-health/channel-readback'",
    'runtimeDataQueried: false',
    'productionDbQueried: false',
    'liveSyntheticMutationAuthorized: false',
    'importOrSyncAuthorized: false',
    'orderIngestionAuthorized: false',
  ],
  'services/bazos-service/src/app.module.ts': [
    "import { BusinessHealthModule } from './business-health/business-health.module';",
    'BusinessHealthModule',
  ],
  'docs/orchestrator/2026-07-06-bazos-business-health-handoff.md': [
    'Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation',
    'GET /bazos/business-health/channel-readback',
    'bazos.channel_readback_business_health.v1',
    '[MISSING: approved live Bazos readback packet]',
    'No live Bazos/provider calls',
  ],
  'implementation-goals/GOAL-26-bazos-business-health-channel-readback.md': [
    'Pre-Coding Gate',
    'Parallel Execution',
    'No live Bazos/provider calls',
    'no deploy',
  ],
  'reports/validation/2026-07-06-bazos-business-health-channel-readback.md': [
    'Artifact Validated',
    'No live Bazos/provider calls',
    'No DB query or mutation',
    'No deploy',
  ],
};

const forbiddenSnippets = [
  'refreshExternalStatuses(',
  'reconcile(',
  'createDraft(',
  'createDraftFromCatalog(',
  'enqueueDraft(',
  'handleWebhook(',
  'create(data',
  'getOrderLifecycleStatus(',
  'prisma.',
  'warehouseClient.',
  'catalogClient.',
  'ordersClient.',
  'orderClient.',
  'amqp.connect',
  'axios.',
  'fetch(',
  'process.env.BAZOS',
  'process.env.DATABASE_URL',
  'process.env.RABBITMQ_URL',
  'process.env.CATALOG',
  'process.env.WAREHOUSE',
  'process.env.ORDERS',
];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

for (const file of requiredFiles) {
  read(file);
}

for (const [file, snippets] of Object.entries(requiredSnippets)) {
  const content = read(file);
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      throw new Error(`Missing snippet in ${file}: ${snippet}`);
    }
  }
}

const serviceContent = read('services/bazos-service/src/business-health/business-health.service.ts');
for (const snippet of forbiddenSnippets) {
  if (serviceContent.includes(snippet)) {
    throw new Error(`Forbidden live/runtime pattern in business health service: ${snippet}`);
  }
}

console.log(JSON.stringify({
  status: 'pass',
  contractId: 'bazos.channel_readback_business_health.v1',
  endpoint: '/bazos/business-health/channel-readback',
  checkedFiles: requiredFiles.length,
  checkedSourceRefs: 8,
  forbiddenPatternsChecked: forbiddenSnippets.length,
}, null, 2));
