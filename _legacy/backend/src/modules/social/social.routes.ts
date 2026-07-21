import { Router } from 'express';
import { socialController } from './social.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { checkUsageLimit } from '../../middleware/usage.middleware';

const router = Router();

router.post('/generate', authenticate, checkUsageLimit, socialController.generate);

export default router;
