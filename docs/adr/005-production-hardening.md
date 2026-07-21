# ADR 005: Production hardening defaults

## Status
Accepted (Faz 9)

## Context
Before soft-launch the API needed abuse controls, liveness/readiness probes, and fail-closed production config.

## Decision
- Global Nest Throttler (default 120 req/min); stricter caps on auth and generation create.
- Helmet security headers (CSP disabled to avoid breaking local media/CORS flows).
- `/v1/health` = liveness; `/v1/ready` = DB (+ storage driver) readiness.
- `assertRuntimeConfig()` exits process in production if JWT/COOKIE/FRONTEND/DATABASE are unsafe.
- `scripts/smoke.mjs` for post-deploy verification.

## Consequences
- Load balancers should use `/v1/ready` for traffic admission.
- Operators must set strong secrets before `NODE_ENV=production`.
