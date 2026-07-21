import { buildMediaKey, getStorage } from './factory';

function sniffMime(buffer: Buffer, fallback = 'image/png') {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    return 'image/webp';
  }
  return fallback;
}

function extensionForMime(mime: string) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/webp') return 'webp';
  return 'png';
}

/** Download a remote image and persist via configured storage driver. */
export async function persistRemoteImage(params: {
  sourceUrl: string;
  orgId: string;
  assetId: string;
}) {
  const res = await fetch(params.sourceUrl);
  if (!res.ok) {
    throw new Error(`Görsel indirilemedi (${res.status})`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const headerMime = res.headers.get('content-type')?.split(';')[0]?.trim();
  const mime = sniffMime(body, headerMime || 'image/png');
  const key = buildMediaKey({
    orgId: params.orgId,
    assetId: params.assetId,
    filename: `image.${extensionForMime(mime)}`,
  });

  const stored = await getStorage().put({ key, body, mime });
  return { ...stored, mime };
}
