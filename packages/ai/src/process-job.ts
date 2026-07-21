import { prisma, ModuleType } from '@ai-fabrikasi/db';
import { CREDIT_COSTS } from '@ai-fabrikasi/shared';
import { persistRemoteImage } from '@ai-fabrikasi/storage';
import {
  runAd,
  runBlog,
  runCv,
  runEmail,
  runLogo,
  runSeo,
  runSocial,
  runThumbnail,
  runTranslation,
} from './modules';

export async function processGenerationJob(jobId: string) {
  const job = await prisma.generationJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error(`Job not found: ${jobId}`);
  if (job.status === 'SUCCEEDED') return job;

  const claimed = await prisma.generationJob.updateMany({
    where: { id: jobId, status: 'QUEUED' },
    data: { status: 'RUNNING', error: null },
  });
  if (claimed.count === 0) {
    return prisma.generationJob.findUnique({ where: { id: jobId } });
  }

  try {
    const rawOutput = (await runModule(job.module, job.inputJson)) as Record<string, unknown>;
    const title = extractTitle(job.module, job.inputJson, rawOutput);

    const asset = await prisma.contentAsset.create({
      data: {
        orgId: job.orgId,
        jobId: job.id,
        module: job.module,
        title,
        outputJson: rawOutput as object,
      },
    });

    let output = rawOutput;
    const sourceUrl =
      typeof rawOutput.imageUrl === 'string' ? rawOutput.imageUrl : null;

    if (sourceUrl) {
      try {
        const stored = await persistRemoteImage({
          sourceUrl,
          orgId: job.orgId,
          assetId: asset.id,
        });
        output = {
          ...rawOutput,
          imageUrl: stored.publicUrl,
          sourceImageUrl: sourceUrl,
        };
        await prisma.$transaction(async (tx) => {
          await tx.contentAsset.update({
            where: { id: asset.id },
            data: { outputJson: output as object },
          });
          await tx.mediaObject.create({
            data: {
              orgId: job.orgId,
              assetId: asset.id,
              storageKey: stored.storageKey,
              mime: stored.mime,
              bytes: stored.bytes,
            },
          });
          await tx.generationJob.update({
            where: { id: job.id },
            data: { status: 'SUCCEEDED' },
          });
        });
      } catch (persistError) {
        console.error('Media persist failed, keeping remote URL', jobId, persistError);
        await prisma.$transaction(async (tx) => {
          await tx.mediaObject.create({
            data: {
              orgId: job.orgId,
              assetId: asset.id,
              storageKey: sourceUrl,
              mime: 'image/png',
              bytes: 0,
            },
          });
          await tx.generationJob.update({
            where: { id: job.id },
            data: { status: 'SUCCEEDED' },
          });
        });
      }
    } else {
      await prisma.generationJob.update({
        where: { id: job.id },
        data: { status: 'SUCCEEDED' },
      });
    }

    return prisma.contentAsset.findUnique({ where: { id: asset.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', error: message },
    });
    try {
      await refundCredits(job.orgId, job.module, job.id);
    } catch (refundError) {
      console.error('Credit refund failed', jobId, refundError);
    }
    throw error;
  }
}

async function refundCredits(orgId: string, module: ModuleType, jobId: string) {
  const amount = CREDIT_COSTS[module] ?? 1;
  const reason = `refund:generation:${jobId}`;

  const already = await prisma.creditLedger.findFirst({
    where: { orgId, jobId, reason },
  });
  if (already) return;

  await prisma.$transaction(async (tx) => {
    await tx.organization.update({
      where: { id: orgId },
      data: { creditBalance: { increment: amount } },
    });
    await tx.creditLedger.create({
      data: {
        orgId,
        jobId,
        delta: amount,
        reason,
      },
    });
  });
}

async function runModule(module: ModuleType, inputJson: unknown) {
  switch (module) {
    case 'SOCIAL':
      return runSocial(inputJson);
    case 'BLOG':
      return runBlog(inputJson);
    case 'AD':
      return runAd(inputJson);
    case 'SEO':
      return runSeo(inputJson);
    case 'EMAIL':
      return runEmail(inputJson);
    case 'TRANSLATION':
      return runTranslation(inputJson);
    case 'THUMBNAIL':
      return runThumbnail(inputJson);
    case 'LOGO':
      return runLogo(inputJson);
    case 'CV':
      return runCv(inputJson);
    default:
      throw new Error(`Modül henüz desteklenmiyor: ${module}`);
  }
}

function extractTitle(module: ModuleType, inputJson: unknown, output: Record<string, unknown>) {
  const input = (inputJson || {}) as Record<string, unknown>;
  if (typeof output.title === 'string') return output.title;
  if (typeof output.headline === 'string') return output.headline;
  if (typeof output.brandName === 'string') return output.brandName;
  if (Array.isArray(output.subjectLines) && typeof output.subjectLines[0] === 'string') {
    return output.subjectLines[0];
  }
  if (Array.isArray(output.titleTags) && typeof output.titleTags[0] === 'string') {
    return output.titleTags[0];
  }
  if (typeof input.topic === 'string') return input.topic;
  if (typeof input.brandName === 'string') return input.brandName;
  if (typeof input.fullName === 'string') return `${input.fullName} CV`;
  if (typeof input.product === 'string') return input.product;
  if (typeof input.purpose === 'string') return input.purpose;
  if (typeof input.targetKeyword === 'string') return input.targetKeyword;
  if (typeof input.text === 'string') return input.text.slice(0, 60);
  return `${module} generation`;
}
