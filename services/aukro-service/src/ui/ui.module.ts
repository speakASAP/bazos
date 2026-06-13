import { Module } from '@nestjs/common';
import { AuthModule } from '@bazos/shared';
import { UiController } from './ui.controller';

@Module({
  imports: [AuthModule],
  controllers: [UiController],
})
export class UiModule {}
