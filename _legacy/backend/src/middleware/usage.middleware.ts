import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../config/database';
import { PLAN_LIMITS } from '../config/plans';

export const checkUsageLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    const now = new Date();
    const resetAt = new Date(user.usageResetAt);
    const monthPassed = now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();

    if (monthPassed) {
      await prisma.user.update({
        where: { id: user.id },
        data: { usageCount: 0, usageResetAt: now },
      });
      user.usageCount = 0;
    }

    const plan = user.plan as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
    if (user.usageCount >= limit) {
      return res.status(429).json({
        success: false,
        message: `Aylık kullanım limitinize ulaştınız (${limit}). Planınızı yükseltin.`,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const incrementUsage = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { usageCount: { increment: 1 } },
  });
};
