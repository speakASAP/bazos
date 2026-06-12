import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { BazosIdentityService } from './bazos-identity.service';
import {
  CreateBazosIdentityDto,
  MarkChallengeDto,
  MarkVerifiedDto,
  UpdateBazosIdentityDto,
} from './bazos-identity.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/bazos/identities')
export class BazosIdentityController {
  constructor(private readonly identityService: BazosIdentityService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateBazosIdentityDto) {
    return this.identityService.create(req.user.id, dto);
  }

  @Get()
  list(@Request() req) {
    return this.identityService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.identityService.findById(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateBazosIdentityDto) {
    return this.identityService.update(id, req.user.id, dto);
  }

  /** Called after human completes Bazos SMS + bank verification. */
  @Post(':id/mark-verified')
  markVerified(@Param('id') id: string, @Request() req, @Body() dto: MarkVerifiedDto) {
    return this.identityService.markVerified(id, req.user.id, dto);
  }

  /** Called when Bazos presents a challenge. Pauses automation for this identity. */
  @Post(':id/mark-challenge')
  markChallenge(@Param('id') id: string, @Body() dto: MarkChallengeDto) {
    return this.identityService.markChallenge(id, dto);
  }
}
