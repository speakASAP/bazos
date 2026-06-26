import { Module } from '@nestjs/common';
import { AuthModule, ClientsModule } from '@bazos/shared';
import { UiController } from './ui.controller';

@Module({
  imports: [AuthModule, ClientsModule],
  controllers: [UiController],
})
export class UiModule {}
