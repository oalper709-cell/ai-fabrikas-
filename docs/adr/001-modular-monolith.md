# ADR-001: Modular monolith + worker

## Status
Accepted (2026-07-21)

## Context
AI generation is long-running and cost-sensitive. Early microservice split increases ops cost without proven scale needs.

## Decision
Ship a modular NestJS monolith API with a separate worker process sharing the same domain packages and PostgreSQL database. Use Redis/BullMQ for async jobs.

## Consequences
- Simpler deploy and debugging in MVP
- Clear module boundaries for later extraction
- Worker can scale independently when needed
