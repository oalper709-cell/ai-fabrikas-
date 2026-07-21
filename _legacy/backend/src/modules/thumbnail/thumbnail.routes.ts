import { Router } from 'express';
import { thumbnailController } from './thumbnail.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { checkUsageLimit } from '../../middleware/usage.middleware';

const router = Router();

router.post('/generate', authenticate, checkUsageLimit, thumbnailController.generate);

export default router;
