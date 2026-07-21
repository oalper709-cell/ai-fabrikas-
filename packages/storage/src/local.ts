import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { ObjectStorage, PutObjectInput, PutObjectResult } from './types';

export function defaultLocalRoot() {
  return (
    process.env.MEDIA_LOCAL_DIR ||
    path.join(os.homedir(), '.ai-fabrikasi', 'media')
  );
}

export class LocalStorage implements ObjectStorage {
  constructor(
    private readonly rootDir = defaultLocalRoot(),
    private readonly publicBase =
      process.env.MEDIA_PUBLIC_BASE_URL || 'http://localhost:4000/v1/media'
  ) {}

  async put(input: PutObjectInput): Promise<PutObjectResult> {
    const fullPath = path.join(this.rootDir, input.key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, input.body);
    return {
      storageKey: input.key,
      bytes: input.body.byteLength,
      publicUrl: `${this.publicBase.replace(/\/$/, '')}/${input.key.split(path.sep).join('/')}`,
    };
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.rootDir, key));
      return true;
    } catch {
      return false;
    }
  }

  resolvePath(key: string) {
    const root = path.resolve(this.rootDir);
    const full = path.resolve(this.rootDir, key);
    const relative = path.relative(root, full);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Geçersiz media yolu');
    }
    return full;
  }
}
