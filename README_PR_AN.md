# PR AN: Compliance – GDPR dataport/export/delete API + privacy webhooks + docs

## Endringsplan
- **API**: `backend/src/compliance/app.ts` (+ `server.ts`) – export, export status, delete, portability
- **Audit**: `backend/src/compliance/audit.ts`
- **Webhooks**: `backend/src/compliance/webhooks.ts` (in-memory mock)
- **Tester**: `backend/tests/compliance_api.test.ts`
- **CI**: `.github/workflows/compliance-api-tests.yml`
- **Docs**: `docs/compliance/*` inkl. OpenAPI spec

## Kjør lokalt
```bash
cd backend
npm ci && npm run build
node dist/compliance/server.js
# test
npm test
```

## Rollback
- Fjern compliance-endepunkter fra router; behold docs og plan for senere re-introduksjon.
