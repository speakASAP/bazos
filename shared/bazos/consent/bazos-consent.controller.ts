import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { BazosIdentityService } from '../identity/bazos-identity.service';
import { BazosConsentService } from './bazos-consent.service';
import { GrantConsentDto } from './bazos-consent.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/bazos/identities/:id/consent')
export class BazosConsentController {
  constructor(
    private readonly consentService: BazosConsentService,
    private readonly identityService: BazosIdentityService,
  ) {}

  @Get()
  async status(@Param('id') id: string, @Request() req) {
    // Throws 404 unless the identity belongs to the caller.
    await this.identityService.findById(id, req.user.id);
    return this.consentService.status(id);
  }

  @Get('history')
  async history(@Param('id') id: string, @Request() req) {
    await this.identityService.findById(id, req.user.id);
    return this.consentService.history(id);
  }

  @Post()
  async grant(@Param('id') id: string, @Request() req, @Body() dto: GrantConsentDto) {
    await this.identityService.findById(id, req.user.id);

    try {
      return await this.consentService.grant({
        identityId: id,
        userId: req.user.id,
        documentVersion: dto.documentVersion,
        ip: req.ip,
        userAgent: req.headers?.['user-agent'],
      });
    } catch (error: any) {
      // A stale client showing superseded wording is a client error, not a 500.
      throw new BadRequestException(error.message);
    }
  }

  @Delete()
  async revoke(@Param('id') id: string, @Request() req) {
    await this.identityService.findById(id, req.user.id);
    return this.consentService.revoke(id);
  }
}
