# Deploy checklist (Faz 8–9)

## Pre-flight
- [ ] Repo ASCII path preferred on Windows (avoid `ı` in folder name for local Postgres)
- [ ] Node 20+
- [ ] `npm install`
- [ ] `npm run build --workspace=@ai-fabrikasi/shared`
- [ ] `npm run build --workspace=@ai-fabrikasi/storage`
- [ ] `npm run build --workspace=@ai-fabrikasi/ai`
- [ ] `npm run db:generate && npm run db:migrate`
- [ ] `npm test` green
- [ ] `npm run typecheck` green

## Secrets / env (api + worker)
- [ ] `DATABASE_URL` (managed Postgres)
- [ ] `REDIS_URL`
- [ ] `JWT_SECRET` (≥32 random chars, not placeholder)
- [ ] `COOKIE_SECURE=true` behind HTTPS
- [ ] `FRONTEND_URL` exact origin
- [ ] `OPENAI_API_KEY`
- [ ] Stripe keys + price IDs (if billing live)
- [ ] Storage:
  - Local/staging: `STORAGE_DRIVER=local`, `MEDIA_PUBLIC_BASE_URL=https://api.example.com/v1/media`
  - Prod: `STORAGE_DRIVER=s3`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL`

## Infra
- [ ] Postgres + Redis up (`docker compose up -d` or managed)
- [ ] Optional MinIO: profile `storage` in compose
- [ ] Migrations applied once per environment
- [ ] API, worker, web deployed as separate processes
- [ ] Worker can reach Redis + DB + storage + OpenAI

## Smoke
- [ ] `GET /v1/health` → ok
- [ ] `GET /v1/ready` → ok (DB reachable)
- [ ] `npm run smoke` against deployed `API_URL`
- [ ] Register / login cookie works cross-origin (CORS + credentials)
- [ ] Create SOCIAL job with credits → SUCCEEDED
- [ ] Create THUMBNAIL job → MediaObject has bytes > 0 and durable URL
- [ ] Fail a job (bad key) → credit refund ledger entry appears
- [ ] Stripe webhook (test mode) updates plan when configured
- [ ] Auth rate limit: rapid login attempts return 429
- [ ] Helmet security headers present on API responses

## Ops
- [ ] Log aggregation + error alerts (Sentry optional)
- [ ] Backup Postgres
- [ ] Rotate JWT/Stripe/S3 secrets policy documented
- [ ] Production boot fails closed if JWT/COOKIE/FRONTEND misconfigured
