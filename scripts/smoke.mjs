#!/usr/bin/env node
/**
 * Post-deploy / local smoke checks.
 * Usage: API_URL=http://localhost:4000/v1 node scripts/smoke.mjs
 */
const base = (process.env.API_URL || 'http://localhost:4000/v1').replace(/\/$/, '');

async function check(path, opts = {}) {
  const res = await fetch(`${base}${path}`, opts);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  const failures = [];

  const health = await check('/health');
  if (!health.ok || health.body?.status !== 'ok') {
    failures.push(`health failed: ${health.status} ${JSON.stringify(health.body)}`);
  } else {
    console.log('✓ /health');
  }

  const ready = await check('/ready');
  if (!ready.ok || ready.body?.status !== 'ok') {
    failures.push(`ready failed: ${ready.status} ${JSON.stringify(ready.body)}`);
  } else {
    console.log(`✓ /ready (storage=${ready.body.storageDriver})`);
  }

  if (failures.length) {
    console.error('\nSmoke FAILED');
    for (const f of failures) console.error('-', f);
    process.exit(1);
  }

  console.log('\nSmoke OK');
}

main().catch((err) => {
  console.error('Smoke crashed:', err.message || err);
  process.exit(1);
});
