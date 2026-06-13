import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ExpireStaleBazosSubmissionsDto,
  ListBazosBlockedAttemptsDto,
  ReconcileBazosIdentityCountsDto,
} from './bazos-monitoring.dto';
import { BazosMonitoringService } from './bazos-monitoring.service';

@UseGuards(JwtAuthGuard)
@Controller('api/bazos/monitoring')
export class BazosMonitoringController {
  constructor(private readonly monitoring: BazosMonitoringService) {}

  @Get('summary')
  summary(@Request() req) {
    return this.monitoring.summary(req.user.id);
  }

  @Get('blocked-attempts')
  blockedAttempts(@Request() req, @Query() query: ListBazosBlockedAttemptsDto) {
    return this.monitoring.blockedAttempts(req.user.id, query);
  }

  @Get('review-identities')
  reviewIdentities(@Request() req) {
    return this.monitoring.reviewIdentities(req.user.id);
  }

  @Post('reconcile-identity-counts')
  reconcileIdentityCounts(@Request() req, @Body() dto: ReconcileBazosIdentityCountsDto = {}) {
    return this.monitoring.reconcileIdentityCounts(req.user.id, dto);
  }

  @Post('expire-stale-submissions')
  expireStaleSubmissions(@Request() req, @Body() dto: ExpireStaleBazosSubmissionsDto = {}) {
    return this.monitoring.expireStaleSubmissions(req.user.id, dto);
  }
}
