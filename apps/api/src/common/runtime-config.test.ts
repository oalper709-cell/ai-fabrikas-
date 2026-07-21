import { describe, expect, it } from 'vitest';
import { assertRuntimeConfig } from './runtime-config';

describe('assertRuntimeConfig', () => {
  it('allows incomplete config in development', () => {
    const result = assertRuntimeConfig({
      NODE_ENV: 'development',
      JWT_SECRET: 'replace-with-long-random-secret',
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('rejects weak production secrets', () => {
    const result = assertRuntimeConfig({
      NODE_ENV: 'production',
      JWT_SECRET: 'short',
      DATABASE_URL: 'postgres://x',
      COOKIE_SECURE: 'false',
      FRONTEND_URL: 'http://localhost:3000',
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/JWT_SECRET/);
    expect(result.errors.join(' ')).toMatch(/COOKIE_SECURE/);
    expect(result.errors.join(' ')).toMatch(/FRONTEND_URL/);
  });

  it('allows localhost prod when ALLOW_LOCAL_PROD=true', () => {
    const result = assertRuntimeConfig({
      NODE_ENV: 'production',
      JWT_SECRET: 'x'.repeat(40),
      DATABASE_URL: 'postgresql://u:p@host/db',
      COOKIE_SECURE: 'false',
      FRONTEND_URL: 'http://localhost:3000',
      ALLOW_LOCAL_PROD: 'true',
    });
    expect(result.ok).toBe(true);
  });

  it('passes strong production config', () => {
    const result = assertRuntimeConfig({
      NODE_ENV: 'production',
      JWT_SECRET: 'x'.repeat(40),
      DATABASE_URL: 'postgresql://u:p@host/db',
      COOKIE_SECURE: 'true',
      FRONTEND_URL: 'https://app.example.com',
    });
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
