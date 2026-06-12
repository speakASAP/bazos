import { Module } from '@nestjs/common';
import { PrismaModule, AuthModule, LoggerModule } from '@bazos/shared';
import { IdentitiesController } from './identities.controller';
import { IdentitiesService } from './identities.service';
import { PublishingController } from './publishing.controller';
import { PublishingPolicyService } from './publishing-policy.service';
import { HumanVerificationController } from './human-verification.controller';
import { HumanVerificationService } from './human-verification.service';
import { PublisherQueueController } from './publisher-queue.controller';
import { PublisherQueueService } from './publisher-queue.service';
import { BazosMonitoringController } from './monitoring.controller';
import { BazosMonitoringService } from './monitoring.service';

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  controllers: [IdentitiesController, PublishingController, HumanVerificationController, PublisherQueueController, BazosMonitoringController],
  providers: [IdentitiesService, PublishingPolicyService, HumanVerificationService, PublisherQueueService, BazosMonitoringService],
  exports: [IdentitiesService, PublishingPolicyService, HumanVerificationService, PublisherQueueService],
})
export class PublishingModule {}
