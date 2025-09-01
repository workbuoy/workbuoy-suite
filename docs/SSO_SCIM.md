# SSO (OIDC) + SCIM 2.0 + Audit

## SSO (OIDC)
- Endepunkter: `/auth/login`, `/auth/callback`, `/auth/logout`, `/auth/me`
- Miljøvariabler:
  - `SSO_ENABLED=true`
  - `OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_CALLBACK_URL`
  - `SESSION_SECRET` (signerer cookie-JWT)
  - `OIDC_DEV_MOCK=1` for mock-login i dev (hopper over ekstern OIDC)

## SCIM 2.0
- Base: `/scim/v2`
- Beskyttet med bearer token `SCIM_BEARER_TOKEN` (sett i IdP)
- Endepunkter:
  - `GET /Users?filter=userName eq "alice"&startIndex=1&count=50`
  - `GET /Users/:id`
  - `POST /Users`
  - `PATCH /Users` (Operations: add/replace/remove – delmengde)
  - `DELETE /Users/:id` (deaktiverer, fjerner ikke)
  - `GET/POST /Groups` (MVP)
- Respons følger SCIM schemas der det er relevant (`ListResponse`, `User`, `Group`).

## Audit
- Standardiserte event-typer:
  - `user.login`, `scim.provision`, `rbac.policy.change`, `rbac.denied`, `crm.mutation`
- Eksport:
  - Fil: `.audit/audit.log` (én JSON-linje per event)
  - Metrics: `audit_events_total`

## Eksempel (Okta/Entra/Google)
1. Opprett OIDC app, auth code + PKCE. Sett callback til `https://api.workbuoy.company/auth/callback`.
2. Claim mapping:
   - `roles` → OIDC custom claim (array) → brukes med RBAC.
3. SCIM:
   - SCIM base-URL: `https://api.workbuoy.company/scim/v2`
   - Bearer token: generer og legg i IdP (Okta: "HTTP Header Authorization").

## Test lokalt
```bash
# SSO mock-login
curl -i 'http://localhost:3000/auth/login?tenant=t1'

# SCIM
export SCIM= 'Authorization: Bearer scim-dev-token'
curl -H "$SCIM" -H 'x-tenant-id:t1' http://localhost:3000/scim/v2/Users
```
