import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ClaimBazosPublishDto,
  EnqueueBazosPublishDto,
  ListBazosPublishQueueDto,
  RecordBazosPublishResultDto,
} from './bazos-publisher-queue.dto';
import { BazosPublisherQueueService } from './bazos-publisher-queue.service';

@UseGuards(JwtAuthGuard)
@Controller('api/bazos')
export class BazosPublisherQueueController {
  constructor(private readonly queue: BazosPublisherQueueService) {}

  @Post('offers/:id/publish')
  publishOffer(@Param('id') id: string, @Request() req, @Body() dto: EnqueueBazosPublishDto) {
    return this.queue.enqueueDraft(id, req.user.id, dto);
  }

  @Get('publish-queue')
  listQueue(@Request() req, @Query() query: ListBazosPublishQueueDto) {
    return this.queue.listQueue(req.user.id, query);
  }

  @Post('publish-queue/claim-next')
  claimNext(@Request() req, @Body() dto: ClaimBazosPublishDto) {
    return this.queue.claimNext(req.user.id, dto);
  }

  @Post('publish-queue/attempts/:id/result')
  recordResult(@Param('id') id: string, @Request() req, @Body() dto: RecordBazosPublishResultDto) {
    return this.queue.recordResult(id, req.user.id, dto);
  }
}
