import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { thumbnailService } from './thumbnail.service';
import { saveContentItem } from '../../utils/content';

export class ThumbnailController {
  generate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await thumbnailService.generate(req.userId!, req.body);
      await saveContentItem({
        userId: req.userId!,
        type: 'THUMBNAIL',
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

export const thumbnailController = new ThumbnailController();
