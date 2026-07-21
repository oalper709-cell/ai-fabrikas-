# ADR 004: Object storage for generated media

## Status
Accepted (Faz 8)

## Context
OpenAI DALL·E image URLs expire. MediaObject previously stored those URLs as `storageKey`, which is not durable.

## Decision
- Introduce `@ai-fabrikasi/storage` with drivers: `local` (default) and `s3` (S3/R2/MinIO).
- After image generation, download bytes and `put` to storage.
- Persist durable `storageKey` + real `bytes` + mime on `MediaObject`.
- Rewrite `outputJson.imageUrl` to the durable public URL when persist succeeds.
- If persist fails, keep remote URL fallback (job still succeeds; ops can alert later).

## Consequences
- Local: files under `MEDIA_LOCAL_DIR`, served by authenticated `GET /v1/media/:orgId/:assetId/:file`.
- Production: set `STORAGE_DRIVER=s3` (+ bucket credentials). Prefer Cloudflare R2 or MinIO-compatible endpoint.
