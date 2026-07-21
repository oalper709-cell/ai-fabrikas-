import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { prisma } from '@ai-fabrikasi/db';
import { getStorageDriver } from '@ai-fabrikasi/storage';
import type { HealthResponse } from '@ai-fabrikasi/shared';

@Injectable()
export class HealthService {
  live(): HealthResponse {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  async ready() {
    const checks: Record<string, 'ok' | 'error'> = {
      database: 'ok',
      storage: 'ok',
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      checks.database = 'error';
    }

    try {
      getStorageDriver();
    } catch {
      checks.storage = 'error';
    }

    const ok = Object.values(checks).every((v) => v === 'ok');
    if (!ok) {
      throw new ServiceUnavailableException({
        status: 'degraded',
        service: 'api',
        checks,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ok' as const,
      service: 'api',
      checks,
      storageDriver: getStorageDriver(),
      timestamp: new Date().toISOString(),
    };
  }
}
