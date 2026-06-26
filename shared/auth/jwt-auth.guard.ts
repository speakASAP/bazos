/**
 * JWT Auth Guard
 * Validates tokens with auth-microservice so Basus accepts the hosted Auth JWT
 * contract used by the browser client.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUser } from './auth.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    const path = request.url || request.path || 'unknown';

    try {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw this.unauthorized('No token provided');
      }

      const validation = await this.authService.validateToken(token);
      if (!validation.valid || !validation.user) {
        throw this.unauthorized('Invalid token');
      }

      request.user = this.normalizeUser(validation.user);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[JwtAuthGuard] Auth token validated for ${path}`, {
          userId: request.user.id,
          totalDuration: `${Date.now() - startTime}ms`,
        });
      }

      return true;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development' || !(error instanceof UnauthorizedException)) {
        console.error(`[JwtAuthGuard] Authentication failed for ${path}`, {
          error: error.message,
          errorType: error.constructor?.name,
          totalDuration: `${Date.now() - startTime}ms`,
        });
      }

      if (error instanceof UnauthorizedException || error?.statusCode === 401) {
        throw this.unauthorized(error.message || 'Authentication failed');
      }
      throw this.unauthorized('Authentication failed');
    }
  }

  private normalizeUser(user: AuthUser): AuthUser {
    const userId = this.firstString(
      user.id,
      (user as any).sub,
      (user as any).userId,
      (user as any).user?.id,
      (user as any).user?.sub,
      (user as any).user?.userId,
    );

    if (!userId) {
      throw this.unauthorized('Invalid token payload: missing user ID');
    }

    const email = this.firstString(user.email, (user as any).user?.email) || `user-${userId}@unknown`;

    return {
      ...user,
      id: userId,
      email,
      firstName: user.firstName || (user as any).first_name || (user as any).user?.firstName || (user as any).user?.first_name,
      lastName: user.lastName || (user as any).last_name || (user as any).user?.lastName || (user as any).user?.last_name,
      phone: user.phone || (user as any).user?.phone,
      isActive: user.isActive !== false && (user as any).user?.isActive !== false,
      isVerified: user.isVerified !== false && (user as any).user?.isVerified !== false,
    };
  }

  private firstString(...values: unknown[]): string | undefined {
    for (const value of values) {
      if (value === undefined || value === null) continue;
      const normalized = String(value).trim();
      if (normalized) return normalized;
    }
    return undefined;
  }

  private unauthorized(message: string): Error & { statusCode: number; status: number } {
    return Object.assign(new Error(message), {
      statusCode: 401,
      status: 401,
    });
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
