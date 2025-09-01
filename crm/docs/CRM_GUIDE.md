# Buoy CRM – Guide (Final Ready)

## Auth (SSO/SCIM)
- **OIDC**: /api/auth/oidc/initiate → Enterprise IdP (ENV: OIDC_AUTHZ_URL, OIDC_CLIENT_ID, OIDC_REDIRECT_URI, OIDC_SCOPE).
- **SAML**: /api/auth/saml/acs (POST). Bruk `passport-saml` i produksjon (skeleton her).
- **SCIM**: /api/scim/v2/Users, /api/scim/v2/Groups. Bearer: SCIM_BEARER.

## Onboarding & Demo
- Side: `/portal/crm/onboarding` – OIDC/SAML + "Prøv demo".
- Demo-data: `/api/onboarding/demo` fyller minimalt dataset (Company, Contact, Deal, Task).

## Webhooks & Sanntid
- Enterprise webhook: `/api/webhooks/enterprise` (header `x-enterprise-signature` = ENTERPRISE_WEBHOOK_SECRET).
- SSE stream: `/api/stream/pipeline` – clients kan lytte på pipeline-hendelser.

## Observability
- **Prometheus**: `wb_crm_pipeline_events_total{event,source}`, `wb_crm_sync_errors_total{source}`.
- **HTTP**: `wb_http_request_duration_seconds`, `wb_http_requests_total`.
- **OTEL**: NodeSDK + OTLP exporter (`OTEL_EXPORTER_OTLP_ENDPOINT`). Startes via `-r ./lib/otel/register` i scripts.

## SDK-bruk og integrasjon
- Adaptere/ingest kan kalle Enterprise SDK – se `lib/crm/ingest/adapters/*` for struktur.

## CI/CD
- GitHub Actions: lint → openapi:validate → jest → playwright → build.
- Node 20.

## ENV-matrise (utdrag)
- OIDC_AUTHZ_URL, OIDC_CLIENT_ID, OIDC_REDIRECT_URI, OIDC_SCOPE
- SAML_CERT, SAML_ISSUER, SAML_AUDIENCE, SAML_REDIRECT_SUCCESS
- SCIM_BEARER
- ENTERPRISE_WEBHOOK_SECRET
- OTEL_EXPORTER_OTLP_ENDPOINT
- WB_RBAC_SIMPLE
- WB_ADAPTERS_{SALESFORCE,HUBSPOT,GMAIL,CALENDAR,SLACK}
- WB_{GMAIL,CALENDAR,SLACK}_TOKEN

## Security hardening (prod)
- **Demo-seed:** /api/onboarding/demo krever `WB_DEMO_ENABLE=true` og RBAC-editor.
- **Webhooks:** HMAC (`X-Signature: sha256=<hex>`, `X-Timestamp`) og 5-min replay window.
- **RBAC & Zod:** Alle skriveruter bak `requireWriteRole` + Zod-validering.
- **OTEL:** Sett `service.name=workbuoy-crm` via env; send til sikret OTLP-endpoint.
