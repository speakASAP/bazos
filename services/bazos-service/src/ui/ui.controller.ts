import { Body, Controller, ForbiddenException, Get, HttpCode, Param, Post, Query, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService, CatalogClientService, JwtAuthGuard } from '@bazos/shared';
import { OrdersService } from '../channel/orders/orders.service';
import { GrowthAttributionService } from './growth-attribution.service';
import { appScript, appStyles, renderAppPage, renderAuthCallbackPage, renderLandingPage } from './ui.assets';
import { consentBannerSource, consentCoreSource } from './consent.assets';
import { FAVICON_ICO } from './favicon.assets';

const ADMIN_ROLE_NAMES = new Set(['admin', 'administrator', 'owner']);
const ADMIN_GLOBAL_ROLES = new Set(['global:admin', 'global:superadmin', 'global:platform_admin']);
const ADMIN_PERMISSION_CLAIMS = new Set(['admin', 'administrator', 'owner', 'bazos:admin', 'bazos-service:admin']);
const ADMIN_APPLICATION_IDS = new Set(['bazos-service', 'bazos']);
const CATALOG_SOURCE_APPLICATION = 'bazos';

@Controller()
export class UiController {
  constructor(
    private readonly authService: AuthService,
    private readonly catalogClient: CatalogClientService,
    private readonly ordersService: OrdersService,
    private readonly growthAttribution: GrowthAttributionService,
  ) {}

  /**
   * Records that a visitor clicked through to the hosted auth flow (EP-005 W4, C-005 §2.2a).
   *
   * Called by the page immediately before it navigates to `auth.alfares.cz`, so the click is
   * recorded even if the visitor registers and closes the tab — waiting for the auth callback
   * would miss exactly the conversions worth counting.
   *
   * Deliberately unauthenticated: the visitor has not registered yet, which is the whole point.
   * `gsid` is read here from the request's own cookie rather than sent by the page, so the
   * attribution token never travels to auth's host, its access logs, or a `Referer` header.
   *
   * Always 204. This endpoint cannot fail a registration: the browser does not wait on the
   * result, and the service swallows its own errors.
   */
  @Post('ui/auth-redirect')
  @HttpCode(204)
  async recordAuthRedirect(
    @Body() body: { state?: string; gsid?: string },
    @Request() req: any,
  ): Promise<void> {
    await this.growthAttribution.recordAuthRedirect({
      state: String(body?.state || ''),
      cookieHeader: req?.headers?.cookie,
      queryGsid: body?.gsid,
    });
  }

  @Get()
  landing(@Res() res: any) {
    return res.type('html').send(renderLandingPage());
  }

  @Get('favicon.ico')
  favicon(@Res() res: any) {
    return res.set('Cache-Control', 'public, max-age=604800').type('image/x-icon').send(FAVICON_ICO);
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

  // Both consent modules sit under /ui/ because consent-banner.js imports
  // './consent-core.js' — the browser resolves that against this same prefix.
  @Get('ui/consent-core.js')
  consentCore(@Res() res: any) {
    return res.set('Cache-Control', 'public, max-age=3600').type('application/javascript').send(consentCoreSource);
  }

  @Get('ui/consent-banner.js')
  consentBanner(@Res() res: any) {
    return res.set('Cache-Control', 'public, max-age=3600').type('application/javascript').send(consentBannerSource);
  }


  @Get('ui/catalog/products')
  @UseGuards(JwtAuthGuard)
  async catalogProducts(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('activeOnly') activeOnly?: string,
    @Query('productId') productId?: string,
    @Request() req?: any,
  ) {
    const cleanProductId = productId?.trim();
    if (cleanProductId) {
      const product = await this.catalogClient.getProductById(cleanProductId, req?.headers?.authorization, 'effective');
      return { items: product ? [product] : [], total: product ? 1 : 0, page: 1, limit: 1, catalogScope: 'effective' };
    }

    const parsedPage = Number(page || 1);
    const parsedLimit = Math.min(Math.max(Number(limit || 20), 1), 50);
    return this.catalogClient.searchProducts({
      search: search?.trim() || undefined,
      isActive: activeOnly === 'false' ? undefined : true,
      catalogScope: 'effective',
      page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : 20,
    }, req?.headers?.authorization);
  }

  @Post('ui/catalog/access/provision')
  @UseGuards(JwtAuthGuard)
  async provisionCatalogAccess(@Request() req: any) {
    return this.catalogClient.provisionAccess(req.headers.authorization, CATALOG_SOURCE_APPLICATION);
  }

  @Get('ui/catalog/products/:productId/content-preview')
  @UseGuards(JwtAuthGuard)
  async catalogProductContentPreview(@Param('productId') productId: string, @Request() req: any) {
    const cleanProductId = productId?.trim();
    if (!cleanProductId) return { preview: null };

    const preview = await this.catalogClient.getProductContentPreview(cleanProductId, 'bazos', req.headers.authorization);
    return { preview };
  }

  @Get('ui/orders')
  @UseGuards(JwtAuthGuard)
  async orders(
    @Request() req: any,
    @Query('scope') scope?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('forwarded') forwarded?: string,
    @Query('accountId') accountId?: string,
  ) {
    const query = { limit, status, forwarded, accountId, centralStatus: 'true' };
    if (scope === 'admin') {
      if (!this.hasAdminAccess(req.user)) {
        throw new ForbiddenException('Administrátorský přístup není povolen pro tento účet');
      }
      return { items: await this.ordersService.findAll(query), scope: 'admin' };
    }

    return { items: await this.ordersService.findForUser(req.user?.id, query), scope: 'client' };
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
