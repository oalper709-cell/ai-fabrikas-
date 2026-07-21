# ADR 006: Containerized deploy targets

## Status
Accepted (Faz 11)

## Context
The monorepo needs a reproducible way to run API, worker, web, Postgres, and Redis together without depending on the Windows project path.

## Decision
- Single multi-target `Dockerfile` for `api`, `worker`, `migrate`
- Separate `Dockerfile.web` with Next.js `output: 'standalone'`
- `docker-compose.prod.yml` orchestrates full stack; default media = local volume
- MinIO available via Compose profile `s3`
- `ALLOW_LOCAL_PROD=true` escape hatch for localhost Docker demos under `NODE_ENV=production`

## Consequences
- First production path is self-host Docker
- Public domain deploys must rebuild web with correct `NEXT_PUBLIC_API_URL`
- CI builds images without pushing (workflow_dispatch / main)
