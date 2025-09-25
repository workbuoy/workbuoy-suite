# PR AI: Salesforce Connector – OAuth2, Mapping, Upsert, DLQ + Alerts

## Innhold
- **OAuth2**: `connectors/salesforce/oauth.js`
- **Mapping**: `connectors/salesforce/mapping.yaml` + `mapper.js`
- **Klient**: `connectors/salesforce/client.js` – upsert via ExternalId
- **DLQ**: `connectors/salesforce/dlq.js` – Redis/fallback
- **Metrikker**: `connectors/salesforce/metrics.js` – Prometheus
- **Worker**: `connectors/salesforce/worker-cli.js`
- **Eksempler**: `connectors/salesforce/examples/*.json`
- **Tester/CI**: `connectors/salesforce/__tests__/upsert.test.js` + workflow
- **Docs**: `docs/CONNECTOR_SALESFORCE.md`

## Kjør
```bash
cd connectors/salesforce
npm ci
npm test
node worker-cli.js --input examples/contact_event.json
```
