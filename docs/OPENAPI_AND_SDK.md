# OpenAPI + SDK Sync

## Swagger UI
- Serveres på `/api-docs` (leser `api-docs/openapi.yaml`).

## OpenAPI
- Skjemaer: Contact, Opportunity, Pipeline, Stage, Organization, Pagination.
- Endepunkter: CRM (contacts, opportunities, pipelines), Import/Eksport, DLQ, Connectors (config/webhook).

## SDK-generering
- TS: `npx @openapitools/openapi-generator-cli generate -i api-docs/openapi.yaml -g typescript-fetch -o sdk/gen/ts`
- Python: `openapi-generator-cli generate -i api-docs/openapi.yaml -g python -o sdk/gen/python`

## Eksempler
- `examples/ts/list_contacts.ts`
- `examples/python/list_contacts.py`

## CI
- `openapi-ci.yml` kjører Spectral-lint på hvert endret spesifikasjons-commit.
