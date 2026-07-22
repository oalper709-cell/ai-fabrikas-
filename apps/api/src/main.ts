import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, raw } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { assertRuntimeConfig } from './common/runtime-config';
import { initSentry } from './common/sentry';

function sanitizeEnv() {
  if (process.env.DATABASE_URL) {
    // Neon pooler + Prisma: channel_binding can break connections
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
      /([&?])channel_binding=require&?/g,
      '$1'
    ).replace(/[?&]$/, '');
  }
  if (process.env.REDIS_URL) {
    process.env.REDIS_URL = process.env.REDIS_URL.replace(/^["']|["']$/g, '');
  }
}

async function bootstrap() {
  sanitizeEnv();
  await initSentry();

  const config = assertRuntimeConfig();
  if (!config.ok) {
    console.error('Invalid runtime config:\n- ' + config.errors.join('\n- '));
    process.exit(1);
  }
  for (const warning of config.warnings) {
    console.warn('[config]', warning);
  }

  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.setGlobalPrefix('v1');
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(cookieParser());

  // Preserve raw body for Stripe webhook signature verification.
  app.use(
    '/v1/billing/webhooks/stripe',
    raw({ type: 'application/json' }),
    (req: { body?: Buffer; rawBody?: Buffer }, _res: unknown, next: () => void) => {
      req.rawBody = req.body;
      next();
    }
  );
  app.use(json({ limit: '2mb' }));

  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on 0.0.0.0:${port}/v1/health`);
  console.log(`Readiness: /v1/ready`);
}

bootstrap().catch((err) => {
  console.error('API bootstrap failed:', err);
  process.exit(1);
});
