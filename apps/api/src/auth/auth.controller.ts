import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { loginSchema, registerSchema, SESSION_COOKIE } from '@ai-fabrikasi/shared';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setSessionCookie(res: Response, token: string) {
    const secure = process.env.COOKIE_SECURE === 'true';
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async register(@Body() body: unknown, @Req() req: Request) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message || 'Geçersiz istek');
    }
    const data = await this.authService.register(parsed.data);
    this.setSessionCookie(req.res as Response, data.token);
    return { success: true, data: { user: data.user, organization: data.organization } };
  }

  @Post('login')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async login(@Body() body: unknown, @Req() req: Request) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message || 'Geçersiz istek');
    }
    const data = await this.authService.login(parsed.data);
    this.setSessionCookie(req.res as Response, data.token);
    return { success: true, data: { user: data.user, organization: data.organization } };
  }

  @Post('logout')
  logout(@Req() req: Request) {
    (req.res as Response).clearCookie(SESSION_COOKIE, { path: '/' });
    return { success: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: { userId: string; orgId: string }) {
    const data = await this.authService.me(user.userId, user.orgId);
    return { success: true, data };
  }
}
