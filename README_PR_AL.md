# PR AL: RBAC tester CRM (record-nivå) + audit

## Endringsplan
- **RBAC**: `src/rbac/policies.ts` – rolle-matrise (viewer/contributor/manager/admin), team/owner/sensitive/pipeline-regler
- **Audit**: `src/rbac/audit.ts` – enkel auditbuffer for testvalidering
- **Mock CRM**: `src/app.ts` – CRUD-endepunkter med RBAC + audit
- **Tester**: `tests/rbac_record_level.test.ts`, `tests/audit_log.test.ts`
- **Docs**: `docs/RBAC_TESTS.md`
- **CI**: `.github/workflows/rbac-tests.yml`

## Kommandoer
```bash
cd backend
npm ci
npm run build
npm test
```

## Manuell validering
- Kall `/_admin/seed` for å laste testdata; prøv ulike roller med `x-user-role`, `x-user-id`, `x-user-team`.
- Finn auditlogg via `/_admin/audit`.

## Rollback
- Reverter policyfil og testrigger; eller sett miljøvariabel i app-koden for å disable RBAC (ikke inkludert i denne PR-en).
