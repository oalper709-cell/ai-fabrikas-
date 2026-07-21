import { Router } from 'express';
import { seoController } from './seo.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { checkUsageLimit } from '../../middleware/usage.middleware';

const router = Router();

router.post('/generate', authenticate, checkUsageLimit, seoController.generate);
router.post('/analyze', authenticate, checkUsageLimit, seoController.analyze);

export default router;
