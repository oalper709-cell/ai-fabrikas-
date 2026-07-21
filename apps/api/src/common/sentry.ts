import type * as SentryType from '@sentry/node';

let sentry: typeof SentryType | null = null;

export async function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return null;

  sentry = await import('@sentry/node');
  sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });
  return sentry;
}

export function captureException(error: unknown) {
  if (sentry) sentry.captureException(error);
}
