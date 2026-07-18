import { Controller, Get } from '@nestjs/common';
import { BusinessHealthService } from './business-health.service';
import { BazosChannelReadbackBusinessHealthEnvelope } from './business-health.types';

@Controller('bazos/business-health')
export class BusinessHealthController {
  constructor(private readonly businessHealthService: BusinessHealthService) {}

  @Get('channel-readback')
  getChannelReadback(): BazosChannelReadbackBusinessHealthEnvelope {
    return this.businessHealthService.getChannelReadbackEnvelope();
  }
}
