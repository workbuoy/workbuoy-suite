# PR Y: CRM observability (webhook + pipeline + latency)

## Endringsplan
- **Metrikker** (`src/metrics/metrics.ts`): 
  - `crm_webhook_success_total`, `crm_webhook_error_total` (labels: provider)
  - `crm_pipeline_transitions_total` (labels: pipeline_id, from_stage, to_stage)
  - `crm_api_latency_ms` (Histogram; labels: method, route, status)
- **Middleware** (`src/middleware/latency.ts`): latency for alle `/api/v1/crm/*` (feature-flag `OBS_CRM_ENABLE`)
- **Ruter**:
  - Connectors webhook (`src/connectors/routes.ts`) – registrerer success/error via query/header
  - CRM pipeline transitions (`src/crm/pipeline.ts`) – teller stage-transitions
- **Dashboards**: `ops/dashboards/workbuoy_crm_observability.json`
- **Tester**: `tests/metrics_exposure.test.ts` – verifiserer eksponering og labels
- **CI**: `.github/workflows/crm-observability-tests.yml`
- **Docs**: `docs/OBSERVABILITY_CRM.md`

## Kommandoer
```bash
cd backend
npm ci
npm run build
npm test
node dist/index.js
# metrics: http://localhost:3000/metrics
```

## Manuell validering
- POST `/api/v1/connectors/hubspot/webhook` (med/uten `?error=1`) og se tellerne øke.
- POST `/api/v1/crm/pipelines/<id>/transitions` med `from_stage`/`to_stage`, verifiser i `/metrics`.
- GET `/api/v1/crm/contacts` og se at `crm_api_latency_ms_*` eksponeres.

## Rollback
- Sett `OBS_CRM_ENABLE=false` for å slå av latency-middleware; behold metrikker men de vil ikke tikke.
