import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@bazos/shared';
import { HumanVerificationService } from './human-verification.service';

@Controller('verification-sessions')
@UseGuards(JwtAuthGuard)
export class HumanVerificationController {
  constructor(private readonly humanVerificationService: HumanVerificationService) {}

  @Get()
  async getSessions(@Query() query: any) {
    return this.humanVerificationService.findAll(query);
  }

  @Post()
  async startSession(@Body() data: any) {
    return this.humanVerificationService.start(data.identityId, data);
  }

  @Post(':id/challenge')
  async markChallenge(@Param('id') id: string, @Body() data: any) {
    return this.humanVerificationService.markChallenge(id, data);
  }

  @Post(':id/complete')
  async completeSession(@Param('id') id: string, @Body() data: any) {
    return this.humanVerificationService.complete(id, data);
  }

  @Post(':id/fail')
  async failSession(@Param('id') id: string, @Body() data: any) {
    return this.humanVerificationService.fail(id, data);
  }
}
