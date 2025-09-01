# Identity & Access – WorkBuoy

## SSO
- **OIDC**: Configure OIDC JWKS URI via `OIDC_JWKS_URI`
- **SAML**: Stub only, via gateway
- **Toggle**: `SSO_ENABLED=true`

## SCIM 2.0
- Endpoints: `/api/scim/v2/Users`, `/api/scim/v2/Groups`
- Filter: minimal (userName eq ...)
- Toggle: `SCIM_ENABLED=true`
- Disabled in `READ_ONLY_MODE=true`

## RBAC
- Roles: admin, manager, contributor, viewer
- Bindings: resource-level (pipeline, contact, etc.)

## Audit
- Logs to file (default `audit.log`)
- Toggle export to S3: `AUDIT_EXPORT_S3=true` (stub)
- Event types: `identity.login`, `scim.*`, `rbac.policy.change`
