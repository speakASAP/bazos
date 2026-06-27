import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@bazos/shared';
import { PublisherQueueService } from './publisher-queue.service';

@Controller('publisher-queue')
@UseGuards(JwtAuthGuard)
export class PublisherQueueController {
  constructor(private readonly publisherQueueService: PublisherQueueService) {}

  @Get()
  async listQueue(@Query() query: any) {
    return this.publisherQueueService.listQueue(query);
  }

  @Get('due')
  async due(@Query() query: any) {
    return this.publisherQueueService.nextDue(Number(query.limit || 5));
  }

  @Post('offers/:id/enqueue')
  async enqueueOffer(@Param('id') id: string, @Body() data?: any) {
    return this.publisherQueueService.enqueueOffer(id, data);
  }

  @Post('claim-next')
  async claimNext(@Body() data?: any) {
    return this.publisherQueueService.claimNext(data);
  }

  @Post('attempts/:id/result')
  async recordResult(@Param('id') id: string, @Body() data: any) {
    return this.publisherQueueService.recordResult(id, data);
  }
}
