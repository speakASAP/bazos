import { Controller, Get, Request, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@bazos/shared';
import { appScript, appStyles, renderAppPage, renderAuthCallbackPage, renderLandingPage } from './ui.assets';

@Controller()
export class UiController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  landing(@Res() res: any) {
    return res.type('html').send(renderLandingPage());
  }

  @Get('admin')
  admin(@Res() res: any) {
    return res.type('html').send(renderAppPage('admin'));
  }

  @Get('client')
  client(@Res() res: any) {
    return res.type('html').send(renderAppPage('client'));
  }

  @Get('auth/callback')
  authCallback(@Res() res: any) {
    return res.type('html').send(renderAuthCallbackPage());
  }

  @Get('ui/app.css')
  styles(@Res() res: any) {
    return res.type('text/css').send(appStyles);
  }

  @Get('ui/app.js')
  script(@Res() res: any) {
    return res.type('application/javascript').send(appScript);
  }


  @Get('ui/auth/me')
  async me(@Request() req: any) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token nebyl poskytnut');
    }

    const validation = await this.authService.validateToken(token);
    if (!validation.valid || !validation.user) {
      throw new UnauthorizedException('Neplatný token');
    }

    return { user: validation.user };
  }
}
