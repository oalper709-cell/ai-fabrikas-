import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { Response } from 'express';
import { LocalStorage, getStorageDriver } from '@ai-fabrikasi/storage';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { prisma } from '@ai-fabrikasi/db';

@Controller('media')
@UseGuards(AuthGuard)
export class MediaController {
  @Get(':orgId/:assetId/:file')
  async serve(
    @Param('orgId') orgId: string,
    @Param('assetId') assetId: string,
    @Param('file') file: string,
    @CurrentUser() user: { orgId: string },
    @Res() res: Response
  ) {
    if (getStorageDriver() !== 'local') {
      throw new NotFoundException('Local media sunucusu kapalı');
    }

    if (orgId !== user.orgId) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    const key = `${orgId}/${assetId}/${file}`;
    const media = await prisma.mediaObject.findFirst({
      where: { orgId: user.orgId, storageKey: key },
    });
    if (!media) throw new NotFoundException('Dosya bulunamadı');

    const local = new LocalStorage();
    const fullPath = local.resolvePath(key);
    try {
      await stat(fullPath);
    } catch {
      throw new NotFoundException('Dosya diskte yok');
    }

    res.setHeader('Content-Type', media.mime || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    createReadStream(fullPath).pipe(res);
  }
}
