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
import { CreateBazosAdDraftDto, UpdateBazosAdDraftDto } from './bazos-ad.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/bazos/ads')
export class BazosAdController {
  constructor(private readonly adService: BazosAdService) {}

  @Post()
  createDraft(@Request() req, @Body() dto: CreateBazosAdDraftDto) {
    return this.adService.createDraft(req.user.id, dto);
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
}
