import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { LoggerModule } from '../logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { BazosIdentityService } from './identity/bazos-identity.service';
import { BazosIdentityController } from './identity/bazos-identity.controller';
import { PublishPolicyService } from './policy/publish-policy.service';
import { BazosAdService } from './ad/bazos-ad.service';
import { BazosAdController } from './ad/bazos-ad.controller';
import { BazosAdAvailabilityScheduler } from './ad/bazos-ad-availability.scheduler';
import { BazosPublisherQueueService } from './publisher/bazos-publisher-queue.service';
import { BazosPublisherQueueController } from './publisher/bazos-publisher-queue.controller';
import { BazosCatalogSellActionService } from './catalog/bazos-catalog-sell-action.service';
import { BazosCatalogSellActionController } from './catalog/bazos-catalog-sell-action.controller';
import { BazosMonitoringService } from './monitoring/bazos-monitoring.service';
import { BazosMonitoringController } from './monitoring/bazos-monitoring.controller';
import { BazosAvailabilityReconciliationService } from './reconciliation/bazos-availability-reconciliation.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule, ClientsModule],
  providers: [
    BazosIdentityService,
    PublishPolicyService,
    BazosAdService,
    BazosAdAvailabilityScheduler,
    BazosPublisherQueueService,
    BazosCatalogSellActionService,
    BazosMonitoringService,
    BazosAvailabilityReconciliationService,
  ],
  controllers: [
    BazosIdentityController,
    BazosAdController,
    BazosPublisherQueueController,
    BazosCatalogSellActionController,
    BazosMonitoringController,
  ],
  exports: [
    BazosIdentityService,
    PublishPolicyService,
    BazosAdService,
    BazosAdAvailabilityScheduler,
    BazosPublisherQueueService,
    BazosCatalogSellActionService,
    BazosMonitoringService,
    BazosAvailabilityReconciliationService,
  ],
})
export class BazosModule {}
