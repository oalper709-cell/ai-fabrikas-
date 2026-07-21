import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createOrgSchema, inviteMemberSchema, SESSION_COOKIE } from '@ai-fabrikasi/shared';
import { OrgService } from './org.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from '../auth/auth.service';

@Controller('orgs')
@UseGuards(AuthGuard, RolesGuard)
export class OrgController {
  constructor(
    private readonly orgService: OrgService,
    private readonly authService: AuthService
  ) {}

  @Post()
  @Roles('VIEWER')
  async create(@CurrentUser() user: { userId: string }, @Body() body: unknown, @Req() req: Request) {
    const parsed = createOrgSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('Geçersiz istek');
    const org = await this.orgService.create(user.userId, parsed.data);
    const token = this.authService.signSession({
      userId: user.userId,
      orgId: org.id,
      role: 'OWNER',
    });
    const secure = process.env.COOKIE_SECURE === 'true';
    (req.res as Response).cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success: true, data: { ...org, role: 'OWNER' } };
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    const data = await this.orgService.get(id, user.userId);
    return { success: true, data };
  }

  @Get(':id/members')
  async members(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    const data = await this.orgService.listMembers(id, user.userId);
    return { success: true, data };
  }

  @Post(':id/members')
  @Roles('ADMIN')
  async invite(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() body: unknown
  ) {
    const parsed = inviteMemberSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('Geçersiz istek');
    const data = await this.orgService.addMember(
      id,
      user.userId,
      parsed.data.email,
      parsed.data.role
    );
    return { success: true, data };
  }
}
