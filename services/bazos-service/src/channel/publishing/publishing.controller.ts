import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
  async checkOffer(@Param('id') id: string, @Body() data?: { identityId?: string }) {
    return this.publishingPolicyService.evaluateOffer(id, data?.identityId);
  }

  @Post('offers/:id/reserve')
  async reserveOffer(@Param('id') id: string, @Body() data?: { identityId?: string }) {
    return this.publishingPolicyService.reserveOfferPublishSlot(id, data?.identityId);
  }
}
