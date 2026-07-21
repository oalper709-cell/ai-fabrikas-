# Hosting guide (Faz 11)

Default path: **self-host with Docker Compose**.  
Alternatives: split Vercel (web) + Railway/Fly (api/worker).

## A) Docker Compose (önerilen ilk canlı)

### Gereksinim
- Docker Desktop / Docker Engine + Compose v2
- En az 2 GB RAM

### Adımlar

```bash
cp .env.production.example .env.production
# JWT_SECRET, POSTGRES_PASSWORD, OPENAI_API_KEY, FRONTEND_URL düzenle

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Servisler:
- `web` → http://localhost:3000
- `api` → http://localhost:4000/v1/health
- `worker` → kuyruk
- `postgres` / `redis` / local media volume

Migrate bir kez `migrate` container’ında otomatik çalışır.

Smoke:

```bash
API_URL=http://localhost:4000/v1 npm run smoke
```

Durdur:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

### Production domain
1. Reverse proxy (Caddy/Nginx/Traefik) → web:3000, api:4000
2. `.env.production` içinde:
   - `FRONTEND_URL=https://app.example.com`
   - `NEXT_PUBLIC_API_URL=https://api.example.com/v1`
   - `COOKIE_SECURE=true`
   - `MEDIA_PUBLIC_BASE_URL=https://api.example.com/v1/media`
3. Web image’ı `NEXT_PUBLIC_API_URL` ile **yeniden build** et (build-time env).

### MinIO / S3
```bash
STORAGE_DRIVER=s3 docker compose -f docker-compose.prod.yml --env-file .env.production --profile s3 up -d --build
```

## B) Vercel (yalnızca web) + Railway (api/worker)

### Web → Vercel
- Root: monorepo, app directory `apps/web`
- Env: `NEXT_PUBLIC_API_URL=https://your-api.up.railway.app/v1`
- Build: `npm run build --workspace=@ai-fabrikasi/shared && npm run build --workspace=@ai-fabrikasi/web`
- Install: `npm install` at repo root

### API + Worker → Railway / Render / Fly
- Dockerfile target `api` ve `worker` (kök `Dockerfile`)
- Managed Postgres + Redis eklentileri
- Env: `docs/deploy-checklist.md` listedeki production alanları
- Health: `/v1/ready`

### Stripe webhook
`https://api.example.com/v1/billing/webhooks/stripe`

## C) Managed DB without Docker apps
Local/dev apps + Neon/Supabase `DATABASE_URL` + Upstash Redis — bkz. `docs/launch-runbook.md`.

## Troubleshooting
| Belirti | Çözüm |
|--------|--------|
| Web API’ye istek atamıyor | CORS `FRONTEND_URL` tam origin; cookie Secure/HTTPS uyumu |
| Image görünmüyor | `MEDIA_PUBLIC_BASE_URL` ve auth’lu `/v1/media` |
| Migrate fail | `DATABASE_URL` host `postgres` (compose içi) |
| Windows path `ı` | Compose kullan; embedded Postgres’ten kaçın |
