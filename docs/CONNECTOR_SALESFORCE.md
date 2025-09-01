# Salesforce Connector (PR AI)

Prod-klar Salesforce-connector med OAuth2, feltmapping, idempotent upsert, DLQ og metrikker.

## Konfig (ENV)
- `SF_TOKEN_URL` – OAuth2 token endpoint (f.eks. `https://login.salesforce.com/services/oauth2/token`)
- `SF_CLIENT_ID`, `SF_CLIENT_SECRET`
- `SF_REFRESH_TOKEN`
- `SF_INSTANCE_URL` – f.eks. `https://yourInstance.my.salesforce.com`
- `REDIS_URL` (valgfritt) – DLQ via Redis (`wb:sf:dlq`); ellers fallback til `connectors/salesforce/dlq.json`
- `METRICS_PORT` (valgfritt) – eksponer Prometheus-metrikker på dette portnummeret

## Mapping
YAML: `connectors/salesforce/mapping.yaml`
```yaml
contact:
  object: "Contact"
  externalIdField: "ExternalId__c"
  externalIdValue: "external_id"
  fields:
    LastName: "name"
    Email: "email"
    Phone: "phone"
    AccountId: "account_id"
    ExternalId__c: "external_id"
```
Bytt `externalIdField` for å matche din `ExternalId__c`-feltdefinisjon.

## Idempotent upsert
PATCH: `/services/data/v58.0/sobjects/<Object>/<ExternalIdField>/<ExternalIdValue>`  
- `201 Created` første gang  
- `204 No Content` ved oppdatering  

## CLI
```bash
# Prosesser events (array) fra fil
node connectors/salesforce/worker-cli.js --input connectors/salesforce/examples/contact_event.json
```

## Metrikker
- `sf_upsert_total`, `sf_errors_total`, `sf_token_refresh_total`, `sf_dlq_depth`

## Tester & CI
- Jest-mock av SF OAuth + upsert (201→204), DLQ fallback til fil.
- Workflow: `.github/workflows/salesforce-connector-tests.yml`
