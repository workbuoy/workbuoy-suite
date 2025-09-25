
# PR — Consolidate core utilities + PriorityBus (DLQ persist) + repos + stubs + server wiring

## Hva som følger med
- Logger med PII-mask og request-middleware som loggfører correlationId/role/autonomy.
- Prioritert eventbus med retry og DLQ til fil + debug-ruter `/api/_debug/{metrics,dlq}`.
- Repo-interfaces for CRM/Tasks/Log (+ in-memory impls), CRM-connector mock, KnowledgeIndex-stub.
- Oppdatert `apps/backend/src/server.ts` med health/ready/build og logger/metrics wiring.
- Enkel backend-CI workflow.

## Slik tester du raskt
- `GET /healthz` → 200
- `GET /api/_debug/metrics` → bus stats
- `GET /api/_debug/dlq` → liste DLQ (tom uten feil)
- Se `workbuoy.log` for request-logging (correlationId synlig).
