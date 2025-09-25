# PR AC: Connectors (Salesforce/HubSpot/Dynamics)

## Endringsplan
- **Webhook**: `src/connectors/webhooks.ts` m/ HMAC-basert signaturverifisering og rå body-capture
- **Polling**: `src/connectors/worker.ts` – `runOnce(config)` som henter kontakter og skriver til CRM
- **Metrics**: `src/connectors/metrics.ts` + registrert i `src/metrics/registry.ts`
- **App wiring**: `src/app.ts` – raw-body for `/api/v1/connectors/**`, `/metrics` rute
- **Tester**: `tests/webhook_signature.test.ts`, `tests/worker_poll.test.ts`
- **Docs**: `docs/CONNECTORS.md`
- **CI**: `.github/workflows/connectors-tests.yml`

## Test-kommandoer
```bash
cd backend
npm ci
npm run build
# webhook-signatur
npx jest tests/webhook_signature.test.ts
# polling (mock provider/CRM)
npx jest tests/worker_poll.test.ts
# kjør en poll-batch manuelt
node dist/connectors/worker.js
```

## Manuell validering
- Konfigurer webhook i provider til `https://api.workbuoy.company/api/v1/connectors/{provider}/webhook` og sett delt HMAC-hemmelighet.
- Verifiser `/metrics` for `wb_connector_*` etter testkall.

## Rollback
- Skru av ved å fjerne secrets/disable webhooks i IdP og stopp worker-jobbene.
