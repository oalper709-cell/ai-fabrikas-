import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { ObjectStorage, PutObjectInput, PutObjectResult } from './types';

export class S3Storage implements ObjectStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT || undefined;
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;

    if (!bucket || !accessKeyId || !secretAccessKey) {
      throw new Error('S3 yapılandırması eksik (S3_BUCKET / S3_ACCESS_KEY / S3_SECRET_KEY)');
    }

    this.bucket = bucket;
    this.publicBase =
      process.env.S3_PUBLIC_URL ||
      process.env.MEDIA_PUBLIC_BASE_URL ||
      (endpoint ? `${endpoint.replace(/\/$/, '')}/${bucket}` : `https://${bucket}.s3.amazonaws.com`);

    this.client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async put(input: PutObjectInput): Promise<PutObjectResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.mime,
      })
    );

    return {
      storageKey: input.key,
      bytes: input.body.byteLength,
      publicUrl: `${this.publicBase.replace(/\/$/, '')}/${input.key}`,
    };
  }
}
