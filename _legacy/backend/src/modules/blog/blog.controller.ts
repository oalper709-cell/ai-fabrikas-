import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { blogService } from './blog.service';
import { saveContentItem } from '../../utils/content';

export class BlogController {
  generate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await blogService.generate(req.userId!, req.body);
      await saveContentItem({
        userId: req.userId!,
        type: 'BLOG',
        title: result.title || req.body.topic,
        input: req.body,
        output: result,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

export const blogController = new BlogController();
