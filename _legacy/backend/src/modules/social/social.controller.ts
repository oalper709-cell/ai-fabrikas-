import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { socialService } from './social.service';
import { saveContentItem } from '../../utils/content';

export class SocialController {
  generate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await socialService.generate(req.userId!, req.body);
      await saveContentItem({
        userId: req.userId!,
        type: 'SOCIAL',
        title: req.body.topic,
        input: req.body,
        output: result,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

export const socialController = new SocialController();
