import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '@bazos/shared';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @Query() query: any) {
    return this.ordersService.findOne(id, query);
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

