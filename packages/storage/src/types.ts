export type PutObjectInput = {
  key: string;
  body: Buffer;
  mime: string;
};

export type PutObjectResult = {
  storageKey: string;
  bytes: number;
  publicUrl: string;
};

export interface ObjectStorage {
  put(input: PutObjectInput): Promise<PutObjectResult>;
  exists?(key: string): Promise<boolean>;
}

export type StorageDriver = 'local' | 's3';
