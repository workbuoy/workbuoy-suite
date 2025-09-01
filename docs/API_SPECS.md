# API Specs – OpenAPI & SDK-regenerering

## Kilde
- `openapi/workbuoy.yaml` (OpenAPI **3.1**)
- Dekker CRM (`/api/v1/crm/*`), Import/Export, Connectors webhooks og RBAC Admin.

## Swagger UI
- Tilgjengelig på **`/docs`** i backend.
- YAML serveres fra `/docs/openapi.yaml`.

## Konvensjoner
- **Headers**: `x-api-key` og `x-tenant-id`
- **Idempotency**: bruk `Idempotency-Key` for muterende batch-operasjoner (import).
- **Versjonering**: `/api/v1/...`; breaking endringer medfører bump til `/api/v2`.

## SDK-regenerering
TypeScript:
```bash
cd backend
npm ci
npm run validate:openapi
npm run gen:sdk:ts
# artefakt: sdk/ts-gen/index.ts
```

Python:
```bash
cd backend
pip install openapi-python-client
npm run gen:sdk:py
# artefakt: sdk/python-gen/
```

## Breaking-change policy
- Minor-versjoner kan legge til felt og nye endepunkter.
- Fjerning/renaming av felt/endepunkter krever **major** og migrasjonsnotat.
