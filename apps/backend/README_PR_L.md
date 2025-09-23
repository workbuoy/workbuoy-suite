# PR L: SSO/SCIM/RBAC + Audit

## Endringsplan
- `src/identity/sso.ts` – OIDC bearer validering (optional mode)
- `src/scim/routes.ts` – SCIM Users/Groups (enkel, i minne)
- `src/rbac/binding.ts` – Gruppe→rolle binding
- `src/audit/export.ts` – Audit-eksport til fil (S3 stub)
- `src/app.ts` – wire SSO + SCIM + metrics
- `tests/*` – røyk-tester

## Kjøring
```bash
cd backend
cp .env.example .env
npm ci
npm run build
node dist/index.js
```

## Tester
```bash
npm test
```

## Rollback
- Skru av via flags: `SSO_ENABLED=false`, `SCIM_ENABLED=false`, `AUDIT_EXPORT_FILE=false`.
