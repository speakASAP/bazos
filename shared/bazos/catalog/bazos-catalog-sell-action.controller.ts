import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  CatalogSellActionStatusQueryDto,
  ConfirmCatalogSellActionDto,
  PrepareCatalogSellActionDto,
} from './bazos-catalog-sell-action.dto';
import { BazosCatalogSellActionService } from './bazos-catalog-sell-action.service';

@UseGuards(JwtAuthGuard)
@Controller('api/bazos/catalog/products/:productId/sell-action')
export class BazosCatalogSellActionController {
  constructor(private readonly sellAction: BazosCatalogSellActionService) {}

  @Post()
  prepare(@Param('productId') productId: string, @Request() req, @Body() dto: PrepareCatalogSellActionDto) {
    return this.sellAction.prepare(req.user.id, productId, dto, req.headers.authorization);
  }

  @Post('confirm')
  confirm(@Param('productId') productId: string, @Request() req, @Body() dto: ConfirmCatalogSellActionDto) {
    return this.sellAction.confirm(req.user.id, productId, dto, req.headers.authorization);
  }

  @Get('status')
  status(@Param('productId') productId: string, @Request() req, @Query() query: CatalogSellActionStatusQueryDto) {
    return this.sellAction.status(req.user.id, productId, query);
  }
}
