import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { LocalStorage } from '../src/local';
import { buildMediaKey, getStorageDriver, resetStorageCache } from '../src/factory';

describe('buildMediaKey', () => {
  it('scopes by org and asset', () => {
    const key = buildMediaKey({
      orgId: 'org_1',
      assetId: 'asset_1',
      filename: 'logo.png',
    });
    expect(key).toBe('org_1/asset_1/logo.png');
  });

  it('sanitizes unsafe filename chars', () => {
    const key = buildMediaKey({
      orgId: 'org',
      assetId: 'a',
      filename: '../evil name!.png',
    });
    expect(key).toBe('org/a/.._evil_name_.png');
  });
});

describe('getStorageDriver', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
    resetStorageCache();
  });

  it('defaults to local', () => {
    delete process.env.STORAGE_DRIVER;
    delete process.env.S3_BUCKET;
    delete process.env.S3_ACCESS_KEY;
    delete process.env.S3_SECRET_KEY;
    expect(getStorageDriver()).toBe('local');
  });

  it('uses s3 when credentials present', () => {
    delete process.env.STORAGE_DRIVER;
    process.env.S3_BUCKET = 'bucket';
    process.env.S3_ACCESS_KEY = 'key';
    process.env.S3_SECRET_KEY = 'secret';
    expect(getStorageDriver()).toBe('s3');
  });
});

describe('LocalStorage', () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'af-media-'));
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it('writes file and returns public url', async () => {
    const storage = new LocalStorage(root, 'http://localhost:4000/v1/media');
    const result = await storage.put({
      key: 'org/asset/test.png',
      body: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      mime: 'image/png',
    });
    expect(result.bytes).toBe(8);
    expect(result.storageKey).toBe('org/asset/test.png');
    expect(result.publicUrl).toBe('http://localhost:4000/v1/media/org/asset/test.png');
    const exists = await storage.exists('org/asset/test.png');
    expect(exists).toBe(true);
  });

  it('blocks path traversal', () => {
    const storage = new LocalStorage(root);
    expect(() => storage.resolvePath('../outside.png')).toThrow(/Geçersiz/);
  });
});
