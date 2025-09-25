# PR Q: Connectors (SF/HS/Dyn) + SDK-CRUD

## Endringsplan
- **Providers**: `backend/src/connectors/providers/{hubspot,salesforce,dynamics}.ts` (webhook-mapping + poll stub)
- **Queue**: `backend/src/connectors/queue.ts` (Redis, DLQ) + `backend/src/connectors/worker.ts` (backoff, spans)
- **Routes**: `backend/src/connectors/routes.ts` (webhook + config)
- **Metrics**: `backend/src/metrics/metrics.ts` med `wb_connector_*`-counters og `/metrics`
- **CRM push**: `backend/src/connectors/crmPush.ts` (overstyrbar i tester)
- **SDK**: `sdk/ts/workbuoy.ts`, `sdk/python/workbuoy.py` (CRUD + import/export helper)
- **Tester**: `backend/tests/connectors.hubspot.test.ts` – webhook → queue → worker → CRM
- **CI**: `.github/workflows/connectors-tests.yml` – kjører tester med Redis-service
- **Docs**: `docs/CONNECTORS.md`

## Test-kommandoer (lokalt)
```bash
cd backend
npm ci
npm run build
npm test
```

## Manuell validering
- POST en HubSpot-lik payload til `/api/v1/connectors/hubspot/webhook` med `x-tenant-id` og se `202 Accepted`.
- Kjør en loop som kaller `runOnce()` i worker og bekreft push til CRM (eller mock via `setCrmPushDelegate`).

## Rollback
- Sett `CONNECTORS_ENABLED=false` i miljø og rull tilbake deploy. DLQ beholder mislykkede meldinger.
