import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { logoService } from './logo.service';
import { saveContentItem } from '../../utils/content';

export class LogoController {
  generate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await logoService.generate(req.userId!, req.body);
      await saveContentItem({
        userId: req.userId!,
        type: 'LOGO',
        title: req.body.brandName,
        input: req.body,
        output: result,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

export const logoController = new LogoController();
