import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { seoService } from './seo.service';
import { saveContentItem } from '../../utils/content';

export class SeoController {
  generate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await seoService.generate(req.userId!, req.body);
      await saveContentItem({
        userId: req.userId!,
        type: 'SEO',
        title: result.title || req.body.topic,
        input: req.body,
        output: result,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  analyze = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await seoService.analyze(req.userId!, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

export const seoController = new SeoController();
