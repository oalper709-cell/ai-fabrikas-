import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { cvService } from './cv.service';
import { saveContentItem } from '../../utils/content';

export class CvController {
  generate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await cvService.generate(req.userId!, req.body);
      await saveContentItem({
        userId: req.userId!,
        type: 'CV',
        title: `${req.body.fullName} — ${req.body.targetRole}`,
        input: req.body,
        output: result,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

export const cvController = new CvController();
