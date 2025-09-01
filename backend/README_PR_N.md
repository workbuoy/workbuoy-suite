# PR N: OpenAPI + SDK sync

## Endringsplan
- `api-docs/openapi.yaml` – komplett CRM-endepunkter
- `src/swagger.ts` – Swagger UI router
- `sdk/gen/*` – autogen stubs for TS/Python
- `examples/*` – kodeeksempler
- `.github/workflows/ci-openapi.yml` – spectral lint

## Bruk
```bash
npm install -g @stoplight/spectral-cli
spectral lint api-docs/openapi.yaml
```

Swagger UI:
```
http://localhost:3000/api-docs
```

SDK:
```bash
openapi-generator-cli generate -i api-docs/openapi.yaml -g typescript-fetch -o sdk/gen/typescript
openapi-generator-cli generate -i api-docs/openapi.yaml -g python -o sdk/gen/python
```

Rollback: behold eksisterende håndskrevne SDK i `sdk/ts`, `sdk/py`.
