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
  CompleteVerificationSessionDto,
  CreateBazosIdentityDto,
  ExpireVerificationSessionDto,
  MarkChallengeDto,
  MarkVerifiedDto,
  StartVerificationSessionDto,
  UpdateBazosIdentityDto,
  VerificationSessionChallengeDto,
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

  @Post(':id/verification-sessions')
  startVerificationSession(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: StartVerificationSessionDto,
  ) {
    return this.identityService.startVerificationSession(id, req.user.id, dto);
  }

  @Post(':id/verification-sessions/:sessionId/complete')
  completeVerificationSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Request() req,
    @Body() dto: CompleteVerificationSessionDto,
  ) {
    return this.identityService.completeVerificationSession(id, sessionId, req.user.id, dto);
  }

  @Post(':id/verification-sessions/:sessionId/challenge')
  recordVerificationChallenge(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Request() req,
    @Body() dto: VerificationSessionChallengeDto,
  ) {
    return this.identityService.recordVerificationChallenge(id, sessionId, req.user.id, dto);
  }

  @Post(':id/verification-sessions/:sessionId/expire')
  expireVerificationSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Request() req,
    @Body() dto: ExpireVerificationSessionDto,
  ) {
    return this.identityService.expireVerificationSession(id, sessionId, req.user.id, dto);
  }

  /** Legacy endpoint retained for clients that complete human verification in one call. */
  @Post(':id/mark-verified')
  markVerified(@Param('id') id: string, @Request() req, @Body() dto: MarkVerifiedDto) {
    return this.identityService.markVerified(id, req.user.id, dto);
  }

  /** Called when Bazos presents a challenge. Pauses automation for this identity. */
  @Post(':id/mark-challenge')
  markChallenge(@Param('id') id: string, @Request() req, @Body() dto: MarkChallengeDto) {
    return this.identityService.markChallenge(id, req.user.id, dto);
  }
}
