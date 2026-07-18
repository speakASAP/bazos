/**
 * Bazos Service App Module
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ChannelModule } from './channel/channel.module';
import { BazosModule, PrismaModule, LoggerModule, HealthModule, RabbitMQModule } from '@bazos/shared';
import { HealthController } from './health/health.controller';
import { UiModule } from './ui/ui.module';

import { BusinessHealthModule } from './business-health/business-health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '../../.env'),
    }),
    PrismaModule,
    LoggerModule,
    HealthModule,
    RabbitMQModule,
    UiModule,
    BazosModule,
    ChannelModule,
    BusinessHealthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
