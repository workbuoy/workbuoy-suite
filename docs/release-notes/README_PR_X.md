# PR X: Swagger/OpenAPI + SDK-regen

## Endringsplan
- **OpenAPI 3.1**: `openapi/workbuoy.yaml` – CRM, Import/Export, Connectors, RBAC
- **Swagger UI**: `backend/src/docs/swagger.ts` – serverer `/docs` + `/docs/openapi.yaml`
- **Backend wiring**: `backend/src/app.ts`, `backend/src/index.ts`
- **SDK-regen**: NPM-scripts for TS og Python + CI som validerer og genererer
- **Docs**: `docs/API_SPECS.md`
- **CI**: `.github/workflows/openapi-sdk.yml`

## Kommandoer
```bash
cd backend
npm ci
npm run validate:openapi
npm run gen:sdk
node dist/index.js   # Swagger UI på http://localhost:3000/docs
```

## Manuell validering
- Åpne `/docs`, test `Try it out` mot lokalt API.
- Bekreft at `sdk/ts-gen/index.ts` og `sdk/python-gen/` genereres.

## Rollback
- Rull tilbake `openapi/workbuoy.yaml`. Eksisterende SDK-er beholdes og kan fortsette å brukes.
