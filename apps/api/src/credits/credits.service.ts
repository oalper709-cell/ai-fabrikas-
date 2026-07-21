import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@ai-fabrikasi/db';

@Injectable()
export class CreditsService {
  async getBalance(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, plan: true, creditBalance: true },
    });
    if (!org) throw new NotFoundException('Organizasyon bulunamadı');
    return org;
  }

  async listLedger(orgId: string, take = 50) {
    return prisma.creditLedger.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /** Atomically reserve/spend credits. Throws if insufficient. */
  async spend(orgId: string, amount: number, reason: string, jobId?: string) {
    if (amount <= 0) throw new ForbiddenException('Geçersiz kredi tutarı');

    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.findUnique({ where: { id: orgId } });
      if (!org) throw new NotFoundException('Organizasyon bulunamadı');
      if (org.creditBalance < amount) {
        throw new ForbiddenException(
          `Yetersiz kredi. Gerekli: ${amount}, mevcut: ${org.creditBalance}`
        );
      }

      const updated = await tx.organization.update({
        where: { id: orgId },
        data: { creditBalance: { decrement: amount } },
      });

      await tx.creditLedger.create({
        data: {
          orgId,
          delta: -amount,
          reason,
          jobId,
        },
      });

      return updated;
    });
  }

  async grant(orgId: string, amount: number, reason: string) {
    if (amount <= 0) throw new ForbiddenException('Geçersiz kredi tutarı');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.organization.update({
        where: { id: orgId },
        data: { creditBalance: { increment: amount } },
      });
      await tx.creditLedger.create({
        data: { orgId, delta: amount, reason },
      });
      return updated;
    });
  }

  async setPlanAndRefreshCredits(orgId: string, plan: string, monthlyCredits: number) {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.update({
        where: { id: orgId },
        data: {
          plan,
          creditBalance: monthlyCredits,
        },
      });
      await tx.creditLedger.create({
        data: {
          orgId,
          delta: monthlyCredits,
          reason: `plan_refresh:${plan}`,
        },
      });
      return org;
    });
  }
}
