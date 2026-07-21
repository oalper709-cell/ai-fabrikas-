import { Router } from 'express';
import { translationController } from './translation.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { checkUsageLimit } from '../../middleware/usage.middleware';

const router = Router();

router.post('/translate', authenticate, checkUsageLimit, translationController.translate);

export default router;
