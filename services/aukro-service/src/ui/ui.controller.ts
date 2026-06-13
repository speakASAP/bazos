import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService, JwtAuthGuard, LoginDto } from '@bazos/shared';
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

  @UseGuards(JwtAuthGuard)
  @Get('ui/auth/me')
  me(@Request() req: any) {
    return { user: req.user };
  }
}
