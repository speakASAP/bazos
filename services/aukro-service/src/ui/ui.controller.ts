import { Controller, ForbiddenException, Get, Query, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService, CatalogClientService, JwtAuthGuard } from '@bazos/shared';
import { appScript, appStyles, renderAppPage, renderAuthCallbackPage, renderLandingPage } from './ui.assets';

const ADMIN_ROLE_NAMES = new Set(['admin', 'administrator', 'owner']);
const ADMIN_GLOBAL_ROLES = new Set(['global:admin', 'global:superadmin', 'global:platform_admin']);
const ADMIN_PERMISSION_CLAIMS = new Set(['admin', 'administrator', 'owner', 'bazos:admin', 'bazos-service:admin']);
const ADMIN_APPLICATION_IDS = new Set(['bazos-service', 'bazos']);

@Controller()
export class UiController {
  constructor(
    private readonly authService: AuthService,
    private readonly catalogClient: CatalogClientService,
  ) {}

  @Get()
  landing(@Res() res: any) {
    return res.type('html').send(renderLandingPage());
  }

  @Get('admin')
  admin(@Res() res: any) {
    return res.set('Cache-Control', 'no-store, max-age=0').type('html').send(renderAppPage('admin'));
  }

  @Get('client')
  client(@Res() res: any) {
    return res.set('Cache-Control', 'no-store, max-age=0').type('html').send(renderAppPage('client'));
  }

  @Get('publish')
  publish(@Query('productId') productId: string | undefined, @Res() res: any) {
    const target = productId
      ? `/client?productId=${encodeURIComponent(productId)}#catalog`
      : '/client#catalog';
    return res.redirect(302, target);
  }

  @Get('auth/callback')
  authCallback(@Res() res: any) {
    return res.set('Cache-Control', 'no-store, max-age=0').type('html').send(renderAuthCallbackPage());
  }

  @Get('ui/app.css')
  styles(@Res() res: any) {
    return res.set('Cache-Control', 'no-store, max-age=0').type('text/css').send(appStyles);
  }

  @Get('ui/app.js')
  script(@Res() res: any) {
    return res.set('Cache-Control', 'no-store, max-age=0').type('application/javascript').send(appScript);
  }


  @Get('ui/catalog/products')
  @UseGuards(JwtAuthGuard)
  async catalogProducts(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('activeOnly') activeOnly?: string,
    @Query('productId') productId?: string,
  ) {
    const cleanProductId = productId?.trim();
    if (cleanProductId) {
      const product = await this.catalogClient.getProductById(cleanProductId);
      return { items: product ? [product] : [], total: product ? 1 : 0, page: 1, limit: 1 };
    }

    const parsedPage = Number(page || 1);
    const parsedLimit = Math.min(Math.max(Number(limit || 20), 1), 50);
    return this.catalogClient.searchProducts({
      search: search?.trim() || undefined,
      isActive: activeOnly === 'false' ? undefined : true,
      page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : 20,
    });
  }


  @Get('ui/auth/me')
  async me(@Request() req: any, @Query('mode') mode?: string) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token nebyl poskytnut');
    }

    const validation = await this.authService.validateToken(token);
    if (!validation.valid || !validation.user) {
      throw new UnauthorizedException('Neplatný token');
    }

    const admin = this.hasAdminAccess(validation.user);
    if (mode === 'admin' && !admin) {
      throw new ForbiddenException('Administrátorský přístup není povolen pro tento účet');
    }

    return { user: validation.user, access: { admin } };
  }

  private hasAdminAccess(user: any): boolean {
    if (!user || typeof user !== 'object') return false;

    const email = String(user.email || '').trim().toLowerCase();
    if (email && this.adminEmailAllowlist().has(email)) return true;
    if (user.isAdmin === true || user.admin === true) return true;

    return [
      user.role,
      user.roles,
      user.permissions,
      user.scopes,
      user.claims?.role,
      user.claims?.roles,
      user.user?.role,
      user.user?.roles,
    ].some((claim) => this.hasAdminClaim(claim));
  }

  private adminEmailAllowlist(): Set<string> {
    return new Set(
      String(process.env.BAZOS_ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  private hasAdminClaim(value: unknown): boolean {
    if (!value) return false;
    if (Array.isArray(value)) return value.some((item) => this.hasAdminClaim(item));
    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>).some((item) => this.hasAdminClaim(item));
    }

    return String(value)
      .split(/[\s,]+/)
      .map((claim) => claim.trim().toLowerCase())
      .filter(Boolean)
      .some((claim) => this.isAdminClaim(claim));
  }

  private isAdminClaim(claim: string): boolean {
    if (ADMIN_GLOBAL_ROLES.has(claim) || ADMIN_PERMISSION_CLAIMS.has(claim)) return true;

    const [scope, applicationId, roleName] = claim.split(':');
    return scope === 'app' && ADMIN_APPLICATION_IDS.has(applicationId) && ADMIN_ROLE_NAMES.has(roleName);
  }
}
