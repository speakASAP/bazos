import { Body, Controller, Get, Post, Request, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService, LoginDto } from '@bazos/shared';
import { appScript, appStyles, renderAppPage, renderLandingPage } from './ui.assets';

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

  @Get('ui/app.css')
  styles(@Res() res: any) {
    return res.type('text/css').send(appStyles);
  }

  @Get('ui/app.js')
  script(@Res() res: any) {
    return res.type('application/javascript').send(appScript);
  }

  @Post('ui/auth/login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('ui/auth/me')
  async me(@Request() req: any) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('No token provided');
    }

    const validation = await this.authService.validateToken(token);
    if (!validation.valid || !validation.user) {
      throw new UnauthorizedException('Invalid token');
    }

    return { user: validation.user };
  }
}
