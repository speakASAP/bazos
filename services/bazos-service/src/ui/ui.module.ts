import { Module } from '@nestjs/common';
import { AuthModule, ClientsModule } from '@bazos/shared';
import { UiController } from './ui.controller';
import { OrdersModule } from '../channel/orders/orders.module';
import { GrowthAttributionService } from './growth-attribution.service';

@Module({
  imports: [AuthModule, ClientsModule, OrdersModule],
  controllers: [UiController],
  providers: [GrowthAttributionService],
})
export class UiModule {}
