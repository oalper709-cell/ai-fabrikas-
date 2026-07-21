import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { processGenerationJob } from '@ai-fabrikasi/ai';

export const GENERATION_QUEUE = 'generation-jobs';

let queue: Queue | null = null;
let redisOk: boolean | null = null;

async function canUseRedis() {
  if (redisOk !== null) return redisOk;
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const redis = new IORedis(url, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    connectTimeout: 1000,
  });
  try {
    await redis.connect();
    await redis.ping();
    await redis.quit();
    redisOk = true;
  } catch {
    redisOk = false;
  }
  return redisOk;
}

function getQueue() {
  if (!queue) {
    queue = new Queue(GENERATION_QUEUE, {
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        maxRetriesPerRequest: null,
      },
    });
  }
  return queue;
}

/** Enqueue via Redis when available; otherwise process inline (local fallback). */
export async function enqueueGeneration(jobId: string) {
  if (await canUseRedis()) {
    await getQueue().add(
      'generate',
      { jobId },
      {
        jobId,
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
      }
    );
    return { mode: 'queue' as const };
  }

  // Local/dev fallback without Redis — do not use in multi-instance production.
  setImmediate(() => {
    processGenerationJob(jobId).catch((err) => {
      console.error('Inline generation failed', jobId, err);
    });
  });
  return { mode: 'inline' as const };
}
