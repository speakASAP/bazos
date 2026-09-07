import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Body,
  Headers,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '@bazos/shared';

const ORDER_AFFINITY_REPLAY_ROLES: ReadonlySet<string> = new Set([
  'internal:bazos-service:order-affinity',
]);

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

@Controller('internal/bazos/order-affinity')
export class InternalOrderAffinityController {
  private readonly authServiceUrl = (
    process.env.AUTH_SERVICE_URL || 'http://auth-microservice:3370'
  ).replace(/\/+$/, '');
  private readonly authValidateTimeoutMs = Number(
    process.env.AUTH_VALIDATE_TIMEOUT_MS || 3000,
  );

  constructor(private readonly ordersService: OrdersService) {}

  @Get('replay-candidates')
  async getReplayCandidates(
    @Query() query: any,
    @Headers('authorization') authorization?: string,
  ): Promise<{ success: boolean; data: any }> {
    await this.assertAuthServicePrincipal(authorization);
    const data = await this.ordersService.getOrderAffinityReplayCandidates(query);
    return { success: true, data };
  }

  private async assertAuthServicePrincipal(authorization?: string): Promise<void> {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const roles = await this.validateRoles(token);
    if (!roles.some((role) => ORDER_AFFINITY_REPLAY_ROLES.has(role))) {
      throw new ForbiddenException('Principal lacks order-affinity role');
    }
  }

  private async validateRoles(token: string): Promise<string[]> {
    const controller = new AbortController();
    const timeoutMs =
      Number.isFinite(this.authValidateTimeoutMs) && this.authValidateTimeoutMs > 0
        ? this.authValidateTimeoutMs
        : 3000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.authServiceUrl}/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        signal: controller.signal,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'bazos_order_affinity_auth_validate_unreachable',
          message: 'Auth validate unreachable during Bazos order-affinity replay',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      throw new UnauthorizedException('Invalid token');
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new UnauthorizedException('Invalid token');
    }

    let data: { valid?: boolean; user?: { roles?: unknown } };
    try {
      data = (await response.json()) as { valid?: boolean; user?: { roles?: unknown } };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (!data.valid || !data.user) {
      throw new UnauthorizedException('Invalid token');
    }

    return Array.isArray(data.user.roles)
      ? data.user.roles.filter((role): role is string => typeof role === 'string')
      : [];
  }
}
