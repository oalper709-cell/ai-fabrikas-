import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/database';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthService {
  async register(data: z.infer<typeof registerSchema>) {
    const parsed = registerSchema.parse(data);
    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) throw new Error('Bu e-posta zaten kayıtlı');

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = await prisma.user.create({
      data: { email: parsed.email, passwordHash, name: parsed.name },
    });

    const token = this.generateToken(user.id);
    return { user: { id: user.id, email: user.email, name: user.name, plan: user.plan }, token };
  }

  async login(data: z.infer<typeof loginSchema>) {
    const parsed = loginSchema.parse(data);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) throw new Error('E-posta veya şifre hatalı');

    const valid = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!valid) throw new Error('E-posta veya şifre hatalı');

    const token = this.generateToken(user.id);
    return { user: { id: user.id, email: user.email, name: user.name, plan: user.plan }, token };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, plan: true, usageCount: true, usageResetAt: true, createdAt: true },
    });
    if (!user) throw new Error('Kullanıcı bulunamadı');
    return user;
  }

  private generateToken(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string & {},
    } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
