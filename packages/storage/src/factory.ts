import { LocalStorage } from './local';
import { S3Storage } from './s3';
import type { ObjectStorage, StorageDriver } from './types';

let cached: ObjectStorage | null = null;

export function getStorageDriver(): StorageDriver {
  const explicit = (process.env.STORAGE_DRIVER || '').toLowerCase();
  if (explicit === 's3' || explicit === 'local') return explicit;
  if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
    return 's3';
  }
  return 'local';
}

export function getStorage(): ObjectStorage {
  if (cached) return cached;
  cached = getStorageDriver() === 's3' ? new S3Storage() : new LocalStorage();
  return cached;
}

/** Test helper */
export function resetStorageCache() {
  cached = null;
}

export function buildMediaKey(params: {
  orgId: string;
  assetId: string;
  filename?: string;
}) {
  const safe = (params.filename || `image-${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${params.orgId}/${params.assetId}/${safe}`;
}
