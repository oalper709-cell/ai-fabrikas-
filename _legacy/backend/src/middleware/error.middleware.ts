import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Geçersiz istek',
      errors: err.errors,
    });
  }

  const message = err.message || 'Sunucu hatası';
  const status = message.includes('API anahtarı') ? 503 : 500;

  res.status(status).json({ success: false, message });
};
