import { Module } from '@nestjs/common';
import { AuthModule, ClientsModule } from '@bazos/shared';
import { UiController } from './ui.controller';
import { OrdersModule } from '../aukro/orders/orders.module';

@Module({
  imports: [AuthModule, ClientsModule, OrdersModule],
  controllers: [UiController],
})
export class UiModule {}
