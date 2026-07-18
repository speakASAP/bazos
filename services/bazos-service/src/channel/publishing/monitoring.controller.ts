import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@bazos/shared';
import { BazosMonitoringService } from './monitoring.service';

@Controller('publishing-monitoring')
@UseGuards(JwtAuthGuard)
export class BazosMonitoringController {
  constructor(private readonly monitoringService: BazosMonitoringService) {}

  @Get('summary')
  async summary() {
    return this.monitoringService.summary();
  }

  @Get('blocked')
  async blocked(@Query() query: any) {
    return this.monitoringService.blocked(Number(query.limit || 50));
  }

  @Post('reconcile-identity-counts')
  async reconcileIdentityCounts() {
    return this.monitoringService.reconcileIdentityCounts();
  }

  @Post('expire-stale-submissions')
  async expireStaleSubmissions(@Body() data?: { maxAgeMinutes?: number }) {
    return this.monitoringService.expireStaleSubmitting(Number(data?.maxAgeMinutes || 30));
  }
}
