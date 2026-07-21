import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { translationService } from './translation.service';
import { saveContentItem } from '../../utils/content';

export class TranslationController {
  translate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await translationService.translate(req.userId!, req.body);
      await saveContentItem({
        userId: req.userId!,
        type: 'TRANSLATION',
        title: `${req.body.sourceLanguage || 'auto'} → ${req.body.targetLanguage}`,
        input: req.body,
        output: result,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

export const translationController = new TranslationController();
