# SSO / SCIM / RBAC – Enterprise Identity

## SSO (OIDC/SAML)
- **OIDC**: sett miljøvariabler:
  - `SSO_ENABLED=true`
  - `OIDC_ISSUER`, `OIDC_AUDIENCE`, `OIDC_JWKS_URL`
- Middleware validerer `Authorization: Bearer <jwt>` og fyller `req.actor_user_id`, `req.tenant_id`, `req.roles`.

## SCIM 2.0
- Endepunkter:
  - `/api/scim/v2/Users` (GET, POST)
  - `/api/scim/v2/Users/:id` (GET, PATCH, DELETE)
  - `/api/scim/v2/Groups` (GET, POST)
  - `/api/scim/v2/Groups/:id` (GET, PATCH, DELETE)
- Paginering: `startIndex`, `count` (enkel implementasjon).
- Filter: `userName eq "value"`.
- Deaktiveres i `READ_ONLY_MODE` for mutasjoner.

## RBAC-binding
- Grupper → Roller → Ressurser (pipeline/record).
- API for binding legges i senere PR; nå exposes bibliotekfunksjoner (`upsertBinding`, `resolveRoles`).

## Audit-eksport
- Til fil (`.audit/events.log`) når `AUDIT_EXPORT_FILE=true`.
- S3-støtte stubbes og legges til i senere PR.

## Test
```bash
cd backend
npm ci && npm run build && npm test
```

## Videre arbeid
- Persist SCIM og RBAC i DB (Prisma) + admin-API
- SAML SP-proxy (metadata, ACS) og signaturvalidering
- Full JWKS-caching, leietaker-mapping, SCIM provisioning-mapper for store IdP-er
