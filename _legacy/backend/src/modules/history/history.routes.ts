import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Response, NextFunction } from 'express';
import { parseContentItem } from '../../utils/content';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.contentItem.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: items.map(parseContentItem) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.contentItem.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!item) return res.status(404).json({ success: false, message: 'Bulunamadı' });
    res.json({ success: true, data: parseContentItem(item) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.contentItem.deleteMany({
      where: { id, userId: req.userId! },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
