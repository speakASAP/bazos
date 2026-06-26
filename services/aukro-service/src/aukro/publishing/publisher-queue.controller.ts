import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@bazos/shared';
import { PublisherQueueService } from './publisher-queue.service';

@Controller('publisher-queue')
@UseGuards(JwtAuthGuard)
export class PublisherQueueController {
  constructor(private readonly publisherQueueService: PublisherQueueService) {}

  @Get()
  async listQueue(@Request() req, @Query() query: any) {
    return this.publisherQueueService.listQueue(req.user.id, query);
  }

  @Get('due')
  async due(@Request() req, @Query() query: any) {
    return this.publisherQueueService.nextDue(req.user.id, Number(query.limit || 5));
  }

  @Post('offers/:id/enqueue')
  async enqueueOffer(@Param('id') id: string, @Request() req, @Body() data?: any) {
    return this.publisherQueueService.enqueueOffer(id, req.user.id, data);
  }

  @Post('claim-next')
  async claimNext(@Request() req, @Body() data?: any) {
    return this.publisherQueueService.claimNext(req.user.id, data);
  }

  @Post('attempts/:id/result')
  async recordResult(@Param('id') id: string, @Request() req, @Body() data: any) {
    return this.publisherQueueService.recordResult(id, req.user.id, data);
  }
}
