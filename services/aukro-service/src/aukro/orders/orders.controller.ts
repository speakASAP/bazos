import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '@bazos/shared';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(@Query() query: any, @Req() req: { user?: any }) {
    return this.ordersService.findVisibleForActor(req.user || {}, query);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @Query() query: any, @Req() req: { user?: any }) {
    return this.ordersService.findOneVisibleForActor(id, req.user || {}, query);
  }

  @Post()
  async createOrder(@Body() data: any) {
    return this.ordersService.create(data);
  }

  @Post('webhook')
  async webhook(@Body() data: any) {
    return this.ordersService.handleWebhook(data);
  }
}

