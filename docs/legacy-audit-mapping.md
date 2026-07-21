# Legacy audit mapping

Salt-okunur denetimler (`_legacy` prototip) ile onaylı mimari / Faz 1 iskeleti arasındaki eşleme.

Kaynak ajanlar:
- Backend: 23f35f0c-b372-415a-b7d0-87204ec5022f
- Frontend: 96579088-b04e-45ea-8b07-822d6760e385
- DevOps: 03cc4bff-b792-4031-8155-54c68513b23d

| Legacy P0/P1 bulgu | Durum | Hedef faz |
|---|---|---|
| SQLite vs Postgres çelişkisi | Yeni `packages/db` PostgreSQL | Faz 1 (iskelet) |
| Stripe kodu yok | Bilinçli; billing ayrı | Faz 3 |
| JWT localStorage | Yeni mimari: HttpOnly cookie | Faz 2 |
| Usage race / atomik kota yok | Credit ledger + job reserve | Faz 3–4 |
| Senkron AI, queue yok | Worker + BullMQ | Faz 4 |
| Kırılgan JSON.parse | Structured output + Zod | Faz 4–5 |
| CV XSS / document.write | Legacy; güvenli export | Faz 6 |
| Mobil nav yarım | Yeni web shell | Faz 2/5 |
| CI/Docker app/README yok | CI + compose + README eklendi | Faz 1 |
| Test/lint yok | Hardening | Faz 7 |
| Image kalıcı storage yok | S3/R2 | Faz 4/8 |

Not: `_legacy/` yalnızca referans. Production yolu `apps/*` + `packages/*`.
