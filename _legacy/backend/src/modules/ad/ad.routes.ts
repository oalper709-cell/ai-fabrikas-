import { Router } from 'express';
import { adController } from './ad.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { checkUsageLimit } from '../../middleware/usage.middleware';

const router = Router();

router.post('/generate', authenticate, checkUsageLimit, adController.generate);

export default router;
