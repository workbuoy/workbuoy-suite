# PR T: CRM RBAC enforcement + Audit panels

## Endringsplan
- **Policy engine**: `src/rbac/policy.ts` – deny-overrides, roller, beslutning
- **Middleware**: `src/rbac/middleware.ts` – `enforce()` + audit + metrics
- **Admin-API**: `src/rbac/routes.ts` – CRUD for RoleBinding
- **Audit**: `src/audit/log.ts` – filbasert audit for RBAC
- **CRM wiring (demo)**: `src/crm/dummy_mutations.ts` – viser påføring av `enforce()`
- **Dashboard**: `ops/dashboards/workbuoy.json` – nye RBAC-paneler
- **Tester**: `tests/rbac.enforce.test.ts`, `tests/rbac.routes.test.ts`
- **CI**: `.github/workflows/rbac-tests.yml`
- **Docs**: `docs/RBAC_ENFORCEMENT.md`

## Test-kommandoer
```bash
cd backend
npm ci
npm run build
npm test
```

## Manuell validering
- Opprett en deny-binding med `POST /api/v1/admin/rbac/bindings` og verifiser 403 på mutasjoner.
- Se at `/metrics` eksponerer `rbac_denied_total` og `rbac_policy_change_total`.

## Rollback
- Sett `RBAC_ENFORCE=false` for å tillate GET uten håndheving og rull tilbake bindings.
