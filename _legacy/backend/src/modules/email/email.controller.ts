import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { emailService } from './email.service';
import { saveContentItem } from '../../utils/content';

export class EmailController {
  generate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await emailService.generate(req.userId!, req.body);
      await saveContentItem({
        userId: req.userId!,
        type: 'EMAIL',
        title: req.body.subject,
        input: req.body,
        output: result,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

export const emailController = new EmailController();
