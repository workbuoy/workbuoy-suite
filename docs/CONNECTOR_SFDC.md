# Salesforce Connector (PR AI)

Denne connectoren håndterer OAuth2, mapping, idempotent upsert og DLQ/alerts for Salesforce → WorkBuoy CRM.

## Miljøvariabler
| Key | Beskrivelse |
|---|---|
| `SFDC_AUTH_METHOD` | `jwt` eller `refresh` |
| `SFDC_CLIENT_ID` | Connected App Client ID |
| `SFDC_USER` | Bruker (JWT subject) |
| `SFDC_JWT_PRIVATE_KEY` | Base64-kodet RSA private key (PEM) |
| `SFDC_REFRESH_TOKEN` | Refresh token (for refresh-flow) |
| `SFDC_TOKEN_URL` | `https://login.salesforce.com` eller `https://test.salesforce.com` |
| `SFDC_BASE_URL` | Base for API-kall (mock i tester) |
| `CRM_BASE_URL`, `API_KEY`, `TENANT_ID` | WorkBuoy API |
| `REDIS_URL` | Redis-URL for idempotency/DLQ |
| `SFDC_RETRY_MAX` | Antall retries før DLQ |

## Kjør
```bash
cd backend
npm ci && npm run build
SFDC_AUTH_METHOD=jwt SFDC_CLIENT_ID=... SFDC_USER=... SFDC_JWT_PRIVATE_KEY=... \SFDC_TOKEN_URL=https://login.salesforce.com SFDC_BASE_URL=https://your.instance/services/data/v59.0 \REDIS_URL=redis://localhost:6379 CRM_BASE_URL=http://localhost:3000 API_KEY=dev TENANT_ID=t1 \node dist/connectors/salesforce/worker-cli.js
```

## Idempotency & DLQ
- **Idempotency**: Redis SETNX på `wb:idemp:sfdc:<kind>:<external_id>` (TTL 24h) hindrer duplikat under kjøring.
- **DLQ**: Poster som feiler etter `SFDC_RETRY_MAX` legges på `wb:dlq:salesforce` med årsak.

## Observability
- **Metrikker**: `sf_ingest_total{object,mode}`, `sf_errors_total{stage}`, `sf_dlq_total{reason}`.
- Grafana/alerts kan legges på p95 ingest-latens, feilrate og DLQ-volum.

## Tester
- Auth (JWT) mot mock-token endpoint.
- Worker ingest (contacts/opp) til mock CRM.
- DLQ scenario ved persistente feil.
