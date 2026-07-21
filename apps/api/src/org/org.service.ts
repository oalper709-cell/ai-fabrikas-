import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma, MembershipRole } from '@ai-fabrikasi/db';
import { CreateOrgInput } from '@ai-fabrikasi/shared';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

@Injectable()
export class OrgService {
  async create(userId: string, input: CreateOrgInput) {
    let slug = slugify(input.name) || `org-${Date.now()}`;
    const taken = await prisma.organization.findUnique({ where: { slug } });
    if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: input.name,
          slug,
          plan: 'FREE',
          creditBalance: 10,
        },
      });
      await tx.membership.create({
        data: { orgId: org.id, userId, role: 'OWNER' },
      });
      await tx.creditLedger.create({
        data: { orgId: org.id, delta: 10, reason: 'welcome_bonus' },
      });
      return org;
    });
  }

  async get(orgId: string, userId: string) {
    const membership = await prisma.membership.findUnique({
      where: { orgId_userId: { orgId, userId } },
      include: {
        org: true,
      },
    });
    if (!membership) throw new NotFoundException('Organizasyon bulunamadı');
    return {
      ...membership.org,
      role: membership.role,
    };
  }

  async listMembers(orgId: string, userId: string) {
    await this.assertMember(orgId, userId);
    return prisma.membership.findMany({
      where: { orgId },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addMember(
    orgId: string,
    actorUserId: string,
    email: string,
    role: MembershipRole
  ) {
    const actor = await this.assertMember(orgId, actorUserId);
    if (!['OWNER', 'ADMIN'].includes(actor.role)) {
      throw new ForbiddenException('Üye ekleme yetkisi yok');
    }
    if (role === 'OWNER' && actor.role !== 'OWNER') {
      throw new ForbiddenException('OWNER atanamaz');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Kullanıcı önce kayıt olmalı');

    return prisma.membership.upsert({
      where: { orgId_userId: { orgId, userId: user.id } },
      create: { orgId, userId: user.id, role },
      update: { role },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  private async assertMember(orgId: string, userId: string) {
    const membership = await prisma.membership.findUnique({
      where: { orgId_userId: { orgId, userId } },
    });
    if (!membership) throw new ForbiddenException('Bu organizasyona erişiminiz yok');
    return membership;
  }
}
