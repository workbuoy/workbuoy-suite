# PR W: SSO + SCIM + Audit

## Endringsplan
- **SSO (OIDC)**: `src/sso/oidc.ts` – login/callback/logout/me, JWT-cookie session, dev mock
- **SCIM 2.0**: `src/scim/**` – Users/Groups, filter (`userName eq`), pagination, bearer-beskyttelse
- **Audit**: `src/audit/audit.ts` – standardiserte events + Prometheus counter `audit_events_total`
- **Metrics**: `src/metrics/metrics.ts` – `/metrics`
- **Wiring**: `src/app.ts`, `src/index.ts`
- **Tester**: `tests/scim.users.test.ts` – CRUD + filter + pagination
- **CI**: `.github/workflows/scim-tests.yml`
- **Docs**: `docs/SSO_SCIM.md`

## Kommandoer
```bash
cd backend
npm ci
npm run build
npm test
node dist/index.js
```

## Manuell validering
- Åpne `/auth/login?tenant=t1` (mock i dev) → sjekk `/auth/me` gir bruker + roller.
- SCIM: opprett user via `POST /scim/v2/Users`, filter `userName eq`, patch displayName, delete (deaktiver).

## Rollback
- Sett `SSO_ENABLED=false` og/eller `SCIM_ENABLED=false` (for SCIM, stoppe route-mounting) i miljø, eller rull tilbake deploy.
