# AI Fabrikası

Production monorepo (Faz 0–11).

## Yapı

```
apps/
  api/      NestJS API (`/v1/...` + local media serve)
  web/      Next.js UI (landing + app shell + 9 modül)
  worker/   BullMQ consumer (+ Redis yoksa DB poll)
packages/
  ai/       OpenAI text + image runners
  storage/  Local + S3/R2/MinIO object storage
  db/       Prisma schema + client
  shared/   Zod + plans + credit costs
  ui/       Shared UI primitives
  config/   Shared TSConfig
docs/       ADR + deploy + hosting + launch runbook
_legacy/    Eski prototip (referans)
```

## Hızlı başlangıç (dev)

1. `npm run env:bootstrap`
2. `npm install`
3. `npm run infra:up`
4. `npm run db:generate && npm run db:migrate`
5. Shared paketleri build et
6. `npm test`
7. `npm run dev:api` / `dev:worker` / `dev:web`

## Canlı (Docker)

1. `cp .env.production.example .env.production` → secrets doldur
2. `npm run prod:up`
3. Web http://localhost:3000 · API http://localhost:4000/v1/health
4. `API_URL=http://localhost:4000/v1 npm run smoke`

Ayrıntılar: `docs/hosting.md`

## Veritabanı (Windows notu)

Klasör yolunda Türkçe `ı` varsa embedded Postgres bozulabilir — Docker Compose veya harici `DATABASE_URL` kullan.

## Dokümanlar

- `docs/deploy-checklist.md`
- `docs/launch-runbook.md`
- `docs/hosting.md`

## Faz durumu

- [x] Faz 0–10 (ürün + polish)
- [x] Faz 11 Deploy packaging: Docker images, prod compose, hosting guide
