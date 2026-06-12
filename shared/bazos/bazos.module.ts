import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { LoggerModule } from '../logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { BazosIdentityService } from './identity/bazos-identity.service';
import { BazosIdentityController } from './identity/bazos-identity.controller';
import { PublishPolicyService } from './policy/publish-policy.service';
import { BazosAdService } from './ad/bazos-ad.service';
import { BazosAdController } from './ad/bazos-ad.controller';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  providers: [BazosIdentityService, PublishPolicyService, BazosAdService],
  controllers: [BazosIdentityController, BazosAdController],
  exports: [BazosIdentityService, PublishPolicyService, BazosAdService],
})
export class BazosModule {}
