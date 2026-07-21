import 'dotenv/config';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processGenerationJob } from '@ai-fabrikasi/ai';
import { ACTIVE_MODULES } from '@ai-fabrikasi/shared';
import { prisma } from '@ai-fabrikasi/db';

const QUEUE = 'generation-jobs';

async function pollFallback() {
  const jobs = await prisma.generationJob.findMany({
    where: { status: 'QUEUED' },
    orderBy: { createdAt: 'asc' },
    take: 5,
  });
  for (const job of jobs) {
    try {
      await processGenerationJob(job.id);
      console.log('Processed job', job.id);
    } catch (error) {
      console.error('Job failed', job.id, error);
    }
  }
}

async function main() {
  console.log(`Worker boot. Active modules: ${ACTIVE_MODULES.join(', ')}`);
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    const connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectTimeout: 1500,
    });
    await connection.connect();
    await connection.ping();

    const worker = new Worker(
      QUEUE,
      async (job) => {
        const jobId = String(job.data.jobId);
        await processGenerationJob(jobId);
      },
      { connection }
    );

    worker.on('completed', (job) => console.log('Queue job completed', job.id));
    worker.on('failed', (job, err) => console.error('Queue job failed', job?.id, err));
    console.log('Worker listening on BullMQ queue:', QUEUE);
  } catch {
    console.warn('Redis unavailable — falling back to DB poll every 3s');
    setInterval(() => {
      pollFallback().catch((err) => console.error(err));
    }, 3000);
  }
}

main();
