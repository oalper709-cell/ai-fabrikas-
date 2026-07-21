import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { createGenerationSchema } from '@ai-fabrikasi/shared';
import { GenerationService } from './generation.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('generations')
  @Roles('MEMBER')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async create(
    @CurrentUser() user: { userId: string; orgId: string },
    @Body() body: unknown
  ) {
    const parsed = createGenerationSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('Geçersiz istek');
    const data = await this.generationService.create(user.orgId, user.userId, parsed.data);
    return {
      success: true,
      data: {
        id: data.job.id,
        status: data.job.status,
        module: data.job.module,
        mode: data.enqueue.mode,
      },
    };
  }

  @Get('generations/:id')
  async get(
    @CurrentUser() user: { orgId: string },
    @Param('id') id: string
  ) {
    const job = await this.generationService.get(user.orgId, id);
    return { success: true, data: job };
  }

  @Get('assets')
  async listAssets(@CurrentUser() user: { orgId: string }) {
    const data = await this.generationService.listAssets(user.orgId);
    return { success: true, data };
  }

  @Get('assets/:id')
  async getAsset(@CurrentUser() user: { orgId: string }, @Param('id') id: string) {
    const data = await this.generationService.getAsset(user.orgId, id);
    return { success: true, data };
  }

  @Delete('assets/:id')
  @Roles('MEMBER')
  async deleteAsset(@CurrentUser() user: { orgId: string }, @Param('id') id: string) {
    const data = await this.generationService.deleteAsset(user.orgId, id);
    return { success: true, data };
  }
}
