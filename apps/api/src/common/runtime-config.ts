/** Fail fast on unsafe production config. */
export function assertRuntimeConfig(env: NodeJS.ProcessEnv = process.env) {
  const errors: string[] = [];
  const isProd = env.NODE_ENV === 'production';
  const allowLocalProd = env.ALLOW_LOCAL_PROD === 'true';

  if (isProd) {
    if (!env.JWT_SECRET || env.JWT_SECRET.includes('replace-with') || env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be a strong secret (≥32 chars) in production');
    }
    if (!env.DATABASE_URL) {
      errors.push('DATABASE_URL is required in production');
    }
    if (!allowLocalProd && env.COOKIE_SECURE !== 'true') {
      errors.push('COOKIE_SECURE=true is required in production');
    }
    if (!env.FRONTEND_URL) {
      errors.push('FRONTEND_URL is required in production');
    } else if (!allowLocalProd && env.FRONTEND_URL.includes('localhost')) {
      errors.push('FRONTEND_URL must be the public origin in production');
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings:
      !isProd && (!env.JWT_SECRET || env.JWT_SECRET.includes('replace-with'))
        ? ['JWT_SECRET is weak/placeholder — auth will reject tokens until set']
        : allowLocalProd
          ? ['ALLOW_LOCAL_PROD=true — localhost production mode enabled']
          : ([] as string[]),
  };
}
