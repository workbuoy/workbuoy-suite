# Dynamics 365 Connector (PR AJ)

Connector mot **Dataverse Web API** med OAuth2 Client Credentials, feltmapping, idempotent upsert via **alternate keys**, backoff/retry og metrikker.

## ENV-konfig
- `DYN_TENANT_ID` – Azure AD tenant
- `DYN_CLIENT_ID`, `DYN_CLIENT_SECRET`
- `DYN_SCOPE` – `https://<org>.crm.dynamics.com/.default` (eller lokalt mock)
- `DYN_BASE_URL` – `https://<org>.crm.dynamics.com`
- `REDIS_URL` (valgfritt) – DLQ via Redis (`wb:dyn:dlq`)
- `METRICS_PORT` (valgfritt) – Prometheus `/metrics`

## Mapping
`connectors/dynamics/mapping.yaml`
```yaml
contact:
  entitySet: "contacts"
  alternateKey: "workbuoy_externalid"
  keyValue: "external_id"
  fields:
    lastname: "name"
    emailaddress1: "email"
    telephone1: "phone"
```

## Upsert-strategi
1) **PATCH** `/api/data/v9.2/<entitySet>(<altKey>='<value>')` med `If-Match: *`.  
- 204 → OK (oppdatert)  
- 404 → finnes ikke ⇒ gå til (2).  
2) **POST** til `/api/data/v9.2/<entitySet>` med `{"<altKey>": value, ...fields}` → 201/204.

## Retry/Backoff
`adaptive_fetch.js` håndterer 429/5xx med eksponentiell backoff og `Retry-After`.

## CLI
```bash
node connectors/dynamics/worker-cli.js --input connectors/dynamics/examples/contact_event.json
```

## Metrikker & dashboard
- `dyn_upsert_total`, `dyn_errors_total`, `dyn_dlq_depth`, `dyn_token_fetch_total`
- Grafana JSON: `grafana/dashboards/connector_dynamics.json` (mock)

## Tester & CI
- Jest-mock av token-endepunkt og Dataverse-upsert (PATCH→404→POST→204→PATCH→204).
- Workflow: `.github/workflows/dynamics-connector-tests.yml`.
