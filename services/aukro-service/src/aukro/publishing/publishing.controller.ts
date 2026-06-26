import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@bazos/shared';
import { PublishingPolicyService } from './publishing-policy.service';

@Controller('publishing')
@UseGuards(JwtAuthGuard)
export class PublishingController {
  constructor(private readonly publishingPolicyService: PublishingPolicyService) {}

  @Get('limits')
  async getLimits() {
    return this.publishingPolicyService.limits();
  }

  @Post('offers/:id/policy-check')
  async checkOffer(@Param('id') id: string, @Request() req, @Body() data?: any) {
    return this.publishingPolicyService.evaluateOffer(id, req.user.id, data?.identityId, data);
  }

  @Post('offers/:id/reserve')
  async reserveOffer(@Param('id') id: string, @Request() req, @Body() data?: any) {
    return this.publishingPolicyService.reserveOfferPublishSlot(id, req.user.id, data?.identityId, data);
  }
}
