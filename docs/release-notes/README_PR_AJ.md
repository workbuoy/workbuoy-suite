# PR AJ: Dynamics 365 Connector – OAuth2 CC, REST adapter, upsert, retry/backoff, DLQ, metrics, Grafana, CI

## Innhold
- **Auth**: `connectors/dynamics/oauth.js` (Client Credentials)
- **Adapter**: `connectors/dynamics/client.js` + `adaptive_fetch.js`
- **Mapping**: `connectors/dynamics/mapping.yaml` + `mapper.js`
- **Worker**: `connectors/dynamics/worker-cli.js`
- **DLQ/Metrics**: `connectors/dynamics/dlq.js`, `metrics.js`
- **Dashboards**: `grafana/dashboards/connector_dynamics.json`
- **Eksempler**: `connectors/dynamics/examples/*.json`
- **Tester/CI**: `__tests__/upsert.test.js` + `.github/workflows/dynamics-connector-tests.yml`
- **Docs**: `docs/CONNECTOR_DYNAMICS.md`

## Hurtigstart
```bash
cd connectors/dynamics
npm ci
npm test
node worker-cli.js --input examples/contact_event.json
```

## Rollback
- Deaktiver connectoren og fjern secrets i miljøet.
