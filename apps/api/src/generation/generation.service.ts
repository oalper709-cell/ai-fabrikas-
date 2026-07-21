import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma, ModuleType } from '@ai-fabrikasi/db';
import {
  CREDIT_COSTS,
  CreateGenerationInput,
  adInputSchema,
  blogInputSchema,
  cvInputSchema,
  emailInputSchema,
  logoInputSchema,
  seoInputSchema,
  socialInputSchema,
  thumbnailInputSchema,
  translationInputSchema,
} from '@ai-fabrikasi/shared';
import { CreditsService } from '../credits/credits.service';
import { enqueueGeneration } from './queue';

@Injectable()
export class GenerationService {
  constructor(private readonly creditsService: CreditsService) {}

  async create(orgId: string, userId: string, payload: CreateGenerationInput) {
    const module = payload.module as ModuleType;
    const input = this.parseInput(module, payload.input);
    const cost = CREDIT_COSTS[module] ?? 1;

    await this.creditsService.spend(orgId, cost, `generation:${module}`);

    const job = await prisma.generationJob.create({
      data: {
        orgId,
        userId,
        module,
        status: 'QUEUED',
        inputJson: input,
      },
    });

    const enqueue = await enqueueGeneration(job.id);
    return { job, enqueue };
  }

  async get(orgId: string, jobId: string) {
    const job = await prisma.generationJob.findFirst({
      where: { id: jobId, orgId },
      include: { asset: { include: { media: true } } },
    });
    if (!job) throw new NotFoundException('İş bulunamadı');
    return job;
  }

  async listAssets(orgId: string, take = 50) {
    return prisma.contentAsset.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take,
      include: { media: true },
    });
  }

  async getAsset(orgId: string, assetId: string) {
    const asset = await prisma.contentAsset.findFirst({
      where: { id: assetId, orgId },
      include: { media: true },
    });
    if (!asset) throw new NotFoundException('İçerik bulunamadı');
    return asset;
  }

  async deleteAsset(orgId: string, assetId: string) {
    const asset = await prisma.contentAsset.findFirst({
      where: { id: assetId, orgId },
    });
    if (!asset) throw new NotFoundException('İçerik bulunamadı');
    await prisma.contentAsset.delete({ where: { id: assetId } });
    return { deleted: true };
  }

  private parseInput(module: ModuleType, input: unknown) {
    try {
      switch (module) {
        case 'SOCIAL':
          return socialInputSchema.parse(input);
        case 'BLOG':
          return blogInputSchema.parse(input);
        case 'AD':
          return adInputSchema.parse(input);
        case 'SEO':
          return seoInputSchema.parse(input);
        case 'EMAIL':
          return emailInputSchema.parse(input);
        case 'TRANSLATION':
          return translationInputSchema.parse(input);
        case 'THUMBNAIL':
          return thumbnailInputSchema.parse(input);
        case 'LOGO':
          return logoInputSchema.parse(input);
        case 'CV':
          return cvInputSchema.parse(input);
        default:
          throw new BadRequestException('Modül desteklenmiyor');
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Geçersiz üretim girdisi');
    }
  }
}
