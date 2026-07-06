export type BazosBusinessHealthStatus = 'pass' | 'warn' | 'blocked';

export interface BazosBusinessHealthSourceRef {
  path: string;
  reason: string;
}

export interface BazosBusinessHealthRuntimeBoundary {
  runtimeDataQueried: false;
  productionDbQueried: false;
  liveSyntheticMutationAuthorized: false;
  externalMarketplaceReadQueried: false;
  externalMarketplaceMutationAuthorized: false;
  importOrSyncAuthorized: false;
  orderIngestionAuthorized: false;
  localAdMutationAuthorized: false;
  warehouseQueried: false;
  catalogQueried: false;
  ordersQueried: false;
}

export interface BazosChannelReadbackBusinessHealthEnvelope {
  service: 'bazos';
  contractId: 'bazos.channel_readback_business_health.v1';
  businessHealthContract: 'stock-order-marketplace-business-health.v1';
  endpoint: '/bazos/business-health/channel-readback';
  status: BazosBusinessHealthStatus;
  generatedAt: string;
  summary: string;
  channel: 'bazos';
  evidenceMode: 'source-only';
  invariant: {
    listingQuantityMustNotExceedWarehouseAvailability: true;
    listingMustNotRemainSellableWhenCatalogUnavailable: true;
    externalReadbackRequiredBeforeRuntimePass: true;
    providerBackedOrderReadbackRequiredBeforeRuntimePass: true;
    humanOrProviderPolicyRequiredForExternalMutation: true;
    bazosVerificationAndChallengeControlsMustNotBeBypassed: true;
  };
  runtimeBoundary: BazosBusinessHealthRuntimeBoundary;
  mutationFlags: {
    mutatesBazos: false;
    mutatesMarketplaceListing: false;
    mutatesLocalAd: false;
    mutatesWarehouse: false;
    mutatesCatalog: false;
    mutatesOrders: false;
    mutatesPayments: false;
    changesSecretsOrEnv: false;
  };
  sourceRefs: BazosBusinessHealthSourceRef[];
  checkedSourceContracts: string[];
  blockers: string[];
  intentChain: {
    vision: string;
    goalImpact: string;
    system: string;
    feature: string;
    task: string;
    executionPlan: string;
    codingPrompt: string;
    code: string[];
    validation: string[];
  };
}
