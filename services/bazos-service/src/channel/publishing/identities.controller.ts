import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@bazos/shared';
import { IdentitiesService } from './identities.service';

@Controller('identities')
@UseGuards(JwtAuthGuard)
export class IdentitiesController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  @Get()
  async getIdentities(@Query() query: any) {
    return this.identitiesService.findAll(query);
  }

  @Get(':id')
  async getIdentity(@Param('id') id: string) {
    return this.identitiesService.findOne(id);
  }

  @Post()
  async createIdentity(@Body() data: any) {
    return this.identitiesService.create(data);
  }

  @Put(':id')
  async updateIdentity(@Param('id') id: string, @Body() data: any) {
    return this.identitiesService.update(id, data);
  }

  @Post(':id/mark-verified')
  async markVerified(@Param('id') id: string, @Body() data?: any) {
    return this.identitiesService.markVerified(id, data);
  }

  @Post(':id/pause')
  async pauseIdentity(@Param('id') id: string, @Body() data: { reason?: string }) {
    return this.identitiesService.pause(id, data?.reason || 'Paused manually');
  }
}
