# Launch runbook (Faz 10)

## 1) Local soft-launch

```bash
node scripts/bootstrap-env.mjs
# Edit apps/api/.env and apps/worker/.env:
# DATABASE_URL, JWT_SECRET, OPENAI_API_KEY

npm install
npm run infra:up          # Postgres + Redis (Docker)
npm run db:generate
npm run db:migrate
npm run build --workspace=@ai-fabrikasi/shared
npm run build --workspace=@ai-fabrikasi/storage
npm run build --workspace=@ai-fabrikasi/ai
npm test

# 3 terminals
npm run dev:api
npm run dev:worker
npm run dev:web
```

Smoke:

```bash
API_URL=http://localhost:4000/v1 npm run smoke
```

Windows path tip: prefer `C:\dev\ai-fabrikasi` (ASCII).

## 2) Staging / production hosts

| Process | Command | Probe |
|--------|---------|-------|
| API | `npm run start --workspace=@ai-fabrikasi/api` | `/v1/ready` |
| Worker | `npm run start --workspace=@ai-fabrikasi/worker` | logs + queue depth |
| Web | `npm run start --workspace=@ai-fabrikasi/web` | `/` |

Required production env (api/worker):
- `NODE_ENV=production`
- `DATABASE_URL`, `REDIS_URL`
- `JWT_SECRET` (≥32), `COOKIE_SECURE=true`
- `FRONTEND_URL=https://your-domain`
- `OPENAI_API_KEY`
- Storage: `STORAGE_DRIVER=s3` + S3_* or local with durable disk
- Optional: `SENTRY_DSN`, Stripe keys

Web:
- `NEXT_PUBLIC_API_URL=https://api.your-domain/v1`
- Optional: `NEXT_PUBLIC_SENTRY_DSN`

## 3) Go-live checklist

1. Migrations applied
2. `npm run smoke` against public API
3. Register → login cookie → create SOCIAL job
4. Thumbnail job persists media (bytes > 0)
5. Billing webhook endpoint reachable (if Stripe live)
6. Sentry receives a test error (optional)

## 4) Rollback

- Redeploy previous API/web/worker images/commits
- Keep DB migrations forward-only; avoid destructive down migrations in prod
