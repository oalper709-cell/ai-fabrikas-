import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@ai-fabrikasi/db';
import { LoginInput, RegisterInput } from '@ai-fabrikasi/shared';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

@Injectable()
export class AuthService {
  private requireSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.includes('replace-with') || secret.includes('change-this')) {
      throw new BadRequestException('JWT_SECRET production değeri ayarlanmalı');
    }
    return secret;
  }

  signSession(payload: { userId: string; orgId: string; role: string }) {
    return jwt.sign(payload, this.requireSecret(), {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }

  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictException('Bu e-posta zaten kayıtlı');

    const orgName = input.organizationName || `${input.name || input.email.split('@')[0]} Workspace`;
    let slug = slugify(orgName) || `org-${Date.now()}`;
    const slugTaken = await prisma.organization.findUnique({ where: { slug } });
    if (slugTaken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const passwordHash = await bcrypt.hash(input.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug,
          creditBalance: 10,
          plan: 'FREE',
        },
      });

      const membership = await tx.membership.create({
        data: {
          orgId: org.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      await tx.creditLedger.create({
        data: {
          orgId: org.id,
          delta: 10,
          reason: 'welcome_bonus',
        },
      });

      return { user, org, membership };
    });

    const token = this.signSession({
      userId: result.user.id,
      orgId: result.org.id,
      role: result.membership.role,
    });

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      organization: {
        id: result.org.id,
        name: result.org.name,
        slug: result.org.slug,
        plan: result.org.plan,
        creditBalance: result.org.creditBalance,
        role: result.membership.role,
      },
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new UnauthorizedException('E-posta veya şifre hatalı');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('E-posta veya şifre hatalı');

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: { org: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) throw new UnauthorizedException('Organizasyon bulunamadı');

    const token = this.signSession({
      userId: user.id,
      orgId: membership.orgId,
      role: membership.role,
    });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
      organization: {
        id: membership.org.id,
        name: membership.org.name,
        slug: membership.org.slug,
        plan: membership.org.plan,
        creditBalance: membership.org.creditBalance,
        role: membership.role,
      },
    };
  }

  async me(userId: string, orgId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı');

    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        org: {
          select: { id: true, name: true, slug: true, plan: true, creditBalance: true },
        },
      },
    });

    const active = memberships.find((m) => m.orgId === orgId) || memberships[0];
    if (!active) throw new UnauthorizedException('Organizasyon bulunamadı');

    return {
      user,
      organization: {
        ...active.org,
        role: active.role,
      },
      organizations: memberships.map((m) => ({
        ...m.org,
        role: m.role,
      })),
    };
  }
}
