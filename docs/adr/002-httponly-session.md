# ADR-002: HttpOnly cookie session

## Status
Accepted (2026-07-21)

## Context
Legacy JWT-in-localStorage exposed tokens to XSS.

## Decision
Use signed JWT stored in `af_session` HttpOnly, SameSite=Lax cookie. AuthGuard reads cookie (Bearer fallback for tooling).

## Consequences
- Requires `credentials: 'include'` on web fetch
- CORS must allow credentials + explicit origin
- CSRF mitigated for simple cookie+SameSite; add CSRF token before cookie-auth state-changing cross-site flows if needed
