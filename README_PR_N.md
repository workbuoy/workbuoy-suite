# PR N: OpenAPI + SDK sync

## Endringsplan
- `api-docs/openapi.yaml` – komplett spes for CRM/Connectors/Import&Export
- `backend/src/docs/swagger.ts` + wiring i `backend/src/app.ts` – Swagger UI på `/api-docs`
- `sdk/gen/{ts,python}` – autogen mapper (README med kommandoer)
- `examples/` – oppdaterte eksempler for nye ruter
- CI: `.github/workflows/openapi-ci.yml` – Spectral lint

## Kjøring
```bash
npm ci && npm run build --prefix backend
node backend/dist/index.js
# Åpne http://localhost:3000/api-docs
```

## SDK
Se `docs/OPENAPI_AND_SDK.md` for generering.
