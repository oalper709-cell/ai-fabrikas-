import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import socialRoutes from './modules/social/social.routes';
import blogRoutes from './modules/blog/blog.routes';
import adRoutes from './modules/ad/ad.routes';
import seoRoutes from './modules/seo/seo.routes';
import translationRoutes from './modules/translation/translation.routes';
import thumbnailRoutes from './modules/thumbnail/thumbnail.routes';
import logoRoutes from './modules/logo/logo.routes';
import emailRoutes from './modules/email/email.routes';
import cvRoutes from './modules/cv/cv.routes';
import historyRoutes from './modules/history/history.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '5mb' }));

const limiter = rateLimit({ windowMs: 60_000, max: 60 });
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/ad', adRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/thumbnail', thumbnailRoutes);
app.use('/api/logo', logoRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/history', historyRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`🏭 AI Fabrikası backend çalışıyor: http://localhost:${PORT}`);
});
