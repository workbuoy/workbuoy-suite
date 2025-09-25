# PR7 — Capability Runner (autonomy 1–6) + kill-switch + degrade rails + unit tests

## Innhold
- `src/core/env.ts` — enkel env-leser for kill-switch
- `src/core/capabilityRunner.ts` — autonomy-aware kjernemotor (observe/suggest/prepare/execute/overlay), degrade på L5 failure, intent logging
- `tests/unit/capabilityRunner.test.ts` — dekker L1..L6, degrade, kill-switch

## Forutsetninger
- `src/core/policy.ts` og `src/core/intentLog.ts` fra PR6
- Ingen OPA nødvendig (local policy fallback brukes når `OPA_URL` ikke er satt)

## Kjøring
```bash
npm test
```

## Neste steg (PR8)
- Finance Orchestrator (simulate-first) + Connector SDK + event-binding (crm.deal.closed → prepareDraft)
