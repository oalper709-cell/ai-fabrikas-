import { Router } from 'express';
import { emailController } from './email.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { checkUsageLimit } from '../../middleware/usage.middleware';

const router = Router();

router.post('/generate', authenticate, checkUsageLimit, emailController.generate);

export default router;
