# PR6 — Core types + Policy facade (OPA fallback) + IntentLog (file sink) + unit tests

## Innhold
- `src/core/types.ts` — Autonomy, PolicyResponse, WorkbuoyEvent
- `src/core/policy.ts` — `policyCheck()` med OPA-HTTP når `OPA_URL` er satt; ellers lokal fallback-regler (finance-capabilities)
- `src/core/intentLog.ts` — `logIntent()` til `intent-log.jsonl` (file sink) eller in-memory
- Tester:
  - `tests/unit/policy.test.ts`
  - `tests/unit/intentLog.test.ts`

## Kjøring
- Test: `npm test` (eller prosjektets testrunner)
- Dev env vars (valgfritt):
  - `INTENT_LOG_SINK=file|mem` (default `file`)
  - `INTENT_LOG_FILE=./intent-log.jsonl`
  - `OPA_URL=http://localhost:8181` (for Rego)

## Neste steg (PR7)
- `src/core/capabilityRunner.ts` — autonomy 1–6 flyt, kill-switch, degrade rails
- Koble `policyCheck()` og `logIntent()` i runner
