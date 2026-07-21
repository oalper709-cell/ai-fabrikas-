import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { adService } from './ad.service';
import { saveContentItem } from '../../utils/content';

export class AdController {
  generate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await adService.generate(req.userId!, req.body);
      await saveContentItem({
        userId: req.userId!,
        type: 'AD',
        title: req.body.product,
        input: req.body,
        output: result,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

export const adController = new AdController();
