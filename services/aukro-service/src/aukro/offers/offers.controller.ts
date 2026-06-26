import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '@bazos/shared';
import { PublishingPolicyService } from '../publishing/publishing-policy.service';
import { PublisherQueueService } from '../publishing/publisher-queue.service';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly publishingPolicyService: PublishingPolicyService,
    private readonly publisherQueueService: PublisherQueueService,
  ) {}

  @Get()
  async getOffers(@Query() query: any) {
    return this.offersService.findAll(query);
  }

  @Get(':id')
  async getOffer(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post()
  async createOffer(@Body() data: any) {
    return this.offersService.create(data);
  }

  @Post('sync')
  async syncOffers(@Body() data?: any) {
    return this.offersService.syncFromCatalog(data);
  }

  @Put(':id')
  async updateOffer(@Param('id') id: string, @Body() data: any) {
    return this.offersService.update(id, data);
  }

  @Delete(':id')
  async deleteOffer(@Param('id') id: string) {
    return this.offersService.delete(id);
  }

  @Post(':id/policy-check')
  async checkPublishPolicy(@Param('id') id: string, @Request() req, @Body() data?: any) {
    return this.publishingPolicyService.evaluateOffer(id, req.user.id, data?.identityId, data);
  }

  @Post(':id/enqueue-publish')
  async enqueuePublish(@Param('id') id: string, @Request() req, @Body() data?: any) {
    return this.publisherQueueService.enqueueOffer(id, req.user.id, data);
  }

  @Post(':id/reserve-publish')
  async reservePublish(@Param('id') id: string, @Request() req, @Body() data?: any) {
    return this.publishingPolicyService.reserveOfferPublishSlot(id, req.user.id, data?.identityId, data);
  }

  @Post(':id/renew')
  async renewAd(@Param('id') id: string, @Body() data?: { days?: number }) {
    return this.offersService.renewAd(id, data?.days);
  }
}

