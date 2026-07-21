#!/usr/bin/env node
/**
 * Copy env templates if missing.
 * Usage: node scripts/bootstrap-env.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const example = path.join(root, '.env.example');

if (!fs.existsSync(example)) {
  console.error('.env.example not found');
  process.exit(1);
}

const targets = [
  path.join(root, 'apps', 'api', '.env'),
  path.join(root, 'apps', 'worker', '.env'),
];

for (const target of targets) {
  if (fs.existsSync(target)) {
    console.log('skip (exists):', path.relative(root, target));
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(example, target);
  console.log('created:', path.relative(root, target));
}

const webEnv = path.join(root, 'apps', 'web', '.env.local');
if (!fs.existsSync(webEnv)) {
  fs.writeFileSync(
    webEnv,
    `NEXT_PUBLIC_API_URL=http://localhost:4000/v1\n# NEXT_PUBLIC_SENTRY_DSN=\n`
  );
  console.log('created:', path.relative(root, webEnv));
} else {
  console.log('skip (exists):', path.relative(root, webEnv));
}

console.log('\nBootstrap env done. Edit JWT_SECRET / DATABASE_URL / OPENAI_API_KEY before running.');
