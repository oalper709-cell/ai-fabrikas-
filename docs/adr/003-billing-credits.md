# ADR-003: Credit ledger + Stripe billing

## Status
Accepted (2026-07-21)

## Context
Soft in-memory usage counters race under concurrency and do not support monetization.

## Decision
- Organization.creditBalance is source of truth for spend checks
- Every grant/spend writes CreditLedger in the same transaction
- Stripe Checkout + signed webhooks activate STARTER/PRO and refresh monthly credits
- Without STRIPE_* env vars, plans remain visible; checkout returns 503

## Consequences
- Generation jobs (Phase 4) must call CreditsService.spend before provider calls
- Webhook endpoint requires raw body verification
