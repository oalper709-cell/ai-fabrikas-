import { Router } from 'express';
import { blogController } from './blog.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { checkUsageLimit } from '../../middleware/usage.middleware';

const router = Router();

router.post('/generate', authenticate, checkUsageLimit, blogController.generate);

export default router;
