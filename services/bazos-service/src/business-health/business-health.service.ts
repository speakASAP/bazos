import { Injectable } from '@nestjs/common';
import { BazosChannelReadbackBusinessHealthEnvelope } from './business-health.types';

const CONTRACT_ID = 'bazos.channel_readback_business_health.v1' as const;
const BUSINESS_HEALTH_CONTRACT = 'stock-order-marketplace-business-health.v1' as const;
const ENDPOINT = '/bazos/business-health/channel-readback' as const;

@Injectable()
export class BusinessHealthService {
  getChannelReadbackEnvelope(): BazosChannelReadbackBusinessHealthEnvelope {
    return {
      service: 'bazos',
      contractId: CONTRACT_ID,
      businessHealthContract: BUSINESS_HEALTH_CONTRACT,
      endpoint: ENDPOINT,
      status: 'warn',
      generatedAt: new Date().toISOString(),
      summary:
        'Bazos source-owned channel readback contract exists; live Bazos/provider readback, import, sync, order ingestion, and marketplace mutation remain gated.',
      channel: 'bazos',
      evidenceMode: 'source-only',
      invariant: {
        listingQuantityMustNotExceedWarehouseAvailability: true,
        listingMustNotRemainSellableWhenCatalogUnavailable: true,
        externalReadbackRequiredBeforeRuntimePass: true,
        providerBackedOrderReadbackRequiredBeforeRuntimePass: true,
        humanOrProviderPolicyRequiredForExternalMutation: true,
        bazosVerificationAndChallengeControlsMustNotBeBypassed: true,
      },
      runtimeBoundary: {
        runtimeDataQueried: false,
        productionDbQueried: false,
        liveSyntheticMutationAuthorized: false,
        externalMarketplaceReadQueried: false,
        externalMarketplaceMutationAuthorized: false,
        importOrSyncAuthorized: false,
        orderIngestionAuthorized: false,
        localAdMutationAuthorized: false,
        warehouseQueried: false,
        catalogQueried: false,
        ordersQueried: false,
      },
      mutationFlags: {
        mutatesBazos: false,
        mutatesMarketplaceListing: false,
        mutatesLocalAd: false,
        mutatesWarehouse: false,
        mutatesCatalog: false,
        mutatesOrders: false,
        mutatesPayments: false,
        changesSecretsOrEnv: false,
      },
      sourceRefs: [
        {
          path: 'shared/bazos/reconciliation/bazos-availability-reconciliation.service.ts',
          reason:
            'Catalog/Warehouse availability reconciliation disables local sellable state while preserving the missing external Bazos de-list capability blocker.',
        },
        {
          path: 'shared/bazos/catalog/bazos-catalog-sell-action.service.ts',
          reason:
            'Catalog sell-action preparation and confirmation use Warehouse/Catalog readiness before draft creation or guarded queueing.',
        },
        {
          path: 'shared/bazos/policy/publish-policy.service.ts',
          reason:
            'Publish policy fails closed on identity, session, active-ad, pacing, category, duplicate, Warehouse, Catalog, and content gates.',
        },
        {
          path: 'shared/rabbitmq/stock-events.subscriber.ts',
          reason:
            'Warehouse stock events project local Bazos ad stock state and explicitly do not mutate Warehouse or external Bazos.',
        },
        {
          path: 'services/bazos-service/src/channel/orders/orders.service.ts',
          reason:
            'Bazos order read/forwarding preserves missing provider-backed item/status contracts and fails closed without Warehouse-owned item mapping.',
        },
        {
          path: 'docs/BAZOS_COMPLIANCE.md',
          reason:
            'Compliance policy requires verified sessions, challenge stop states, pacing, duplicate controls, and no Bazos control bypass.',
        },
        {
          path: 'docs/orchestrator/2026-07-05-runtime-gate-packet-handoff.md',
          reason:
            'Runtime gate handoff preserves owner-approved packet requirements before live provider/readback proof.',
        },
        {
          path: 'reports/validation/2026-07-05-W8-bazos-provider-proof-gate.md',
          reason:
            'Provider-backed proof gate records source-only lifecycle proof boundaries and the missing live provider contract.',
        },
      ],
      checkedSourceContracts: [
        'bazos.availability_reconciliation.source.v1',
        'bazos.catalog_sell_action.guardrails.v1',
        'bazos.publish_policy.fail_closed.v1',
        'bazos.stock_event_projection.source.v1',
        'bazos.order_lifecycle_provider_gate.v1',
        'stock-order-marketplace-business-health.v1',
      ],
      blockers: [
        '[MISSING: approved live Bazos readback packet]',
        '[MISSING: target product/listing/account for Bazos channel readback proof]',
        '[UNKNOWN: live Bazos marketplace webhook support]',
        '[MISSING: provider-backed Bazos order item/status ingestion contract]',
        '[MISSING: approved reconciliation rule that maps Warehouse/Catalog availability to Bazos sellable quantity without external mutation side effects]',
        '[MISSING: owner-approved Bazos external delete/de-list capability]',
      ],
      intentChain: {
        vision: 'BUSINESS.md',
        goalImpact: 'implementation-goals/GOAL-26-bazos-business-health-channel-readback.md',
        system: 'SYSTEM.md',
        feature: 'docs/orchestrator/2026-07-06-bazos-business-health-handoff.md',
        task: 'implementation-goals/GOAL-26-bazos-business-health-channel-readback.md',
        executionPlan: 'docs/orchestrator/2026-07-06-bazos-business-health-handoff.md',
        codingPrompt: 'Codex prompt 2026-07-06 Bazos service-owned business-health channel readback envelope',
        code: [
          'services/bazos-service/src/business-health/business-health.controller.ts',
          'services/bazos-service/src/business-health/business-health.service.ts',
          'services/bazos-service/src/business-health/business-health.types.ts',
        ],
        validation: [
          'scripts/verify-business-health-bazos-channel-contract.js',
          'npm --prefix services/bazos-service run build',
          'git diff --check',
        ],
      },
    };
  }
}
