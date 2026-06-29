import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { BazosAdService } from './bazos-ad.service';
import { CreateBazosAdDraftDto, CreateBazosAdDraftFromCatalogDto, UpdateBazosAdDraftDto } from './bazos-ad.dto';
import { EnqueueBazosPublishDto } from '../publisher/bazos-publisher-queue.dto';
import { BazosPublisherQueueService } from '../publisher/bazos-publisher-queue.service';

@UseGuards(JwtAuthGuard)
@Controller('api/bazos/ads')
export class BazosAdController {
  constructor(
    private readonly adService: BazosAdService,
    private readonly queueService: BazosPublisherQueueService,
  ) {}

  @Post()
  createDraft(@Request() req, @Body() dto: CreateBazosAdDraftDto) {
    return this.adService.createDraft(req.user.id, dto);
  }

  @Post('from-catalog')
  createDraftFromCatalog(@Request() req, @Body() dto: CreateBazosAdDraftFromCatalogDto) {
    return this.adService.createDraftFromCatalog(req.user.id, dto);
  }

  @Get()
  list(
    @Request() req,
    @Query('identityId') identityId?: string,
    @Query('productId') productId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.adService.findMany(req.user.id, {
      identityId,
      productId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Post('refresh')
  refreshExternalStatuses(@Request() req) {
    return this.adService.refreshExternalStatuses(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.adService.findById(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateBazosAdDraftDto) {
    return this.adService.updateDraft(id, req.user.id, dto);
  }

  /** Evaluate all compliance gates for a draft. Returns policy result without publishing. */
  @Post(':id/evaluate-policy')
  evaluatePolicy(@Param('id') id: string, @Request() req) {
    return this.adService.evaluatePublishPolicy(id, req.user.id);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Request() req, @Body() dto: EnqueueBazosPublishDto) {
    return this.queueService.enqueueDraft(id, req.user.id, dto);
  }
}
