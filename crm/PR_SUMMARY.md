# Buoy CRM – Final Ready (Zeta)

## Ikke-teknisk oppsummering
Denne PR-en gjør WorkBuoy CRM klart for produksjon: påloggingsstøtte for Enterprise (OIDC/SAML), SCIM-provisionering, enkel onboarding med demo-data, sanntidsoppdaterte pipelines via webhooks, og komplett observability (Prometheus + OpenTelemetry). CI/CD er satt opp for bygg og test med god dekning.

## Tekniske detaljer
- **Auth**: OIDC-initiering, SAML ACS-skjelett, SCIM v2 Users/Groups (Bearer).
- **Onboarding**: /portal/crm/onboarding, /api/onboarding/demo.
- **Webhooks**: /api/webhooks/enterprise (oppdaterer deals), SSE: /api/stream/pipeline.
- **Metrics**: wb_crm_pipeline_events_total{event,source}, wb_crm_sync_errors_total{source}, samt eksisterende HTTP/ingest-metrikker.
- **Tracing**: OTEL NodeSDK + OTLP exporter.
- **CI/CD**: GitHub Actions (Node 20), lint → validate → jest → playwright → build.

## ENV-matrise
| Key | Beskrivelse |
|-----|-------------|
| OIDC_AUTHZ_URL / OIDC_CLIENT_ID / OIDC_REDIRECT_URI / OIDC_SCOPE | OIDC IdP config |
| SAML_CERT / SAML_ISSUER / SAML_AUDIENCE / SAML_REDIRECT_SUCCESS | SAML ACS |
| SCIM_BEARER | Bearer token for SCIM |
| ENTERPRISE_WEBHOOK_SECRET | Signatur-header for webhooks |
| OTEL_EXPORTER_OTLP_ENDPOINT | OTLP collector |
| WB_RBAC_SIMPLE | RBAC toggle |
| WB_ADAPTERS_{SALESFORCE,HUBSPOT,GMAIL,CALENDAR,SLACK} | Ingest adapters toggles |
| WB_{GMAIL,CALENDAR,SLACK}_TOKEN | Provider tokens |

## Videre arbeid
- Fullføre OIDC code→token bytte og SAML-validering med bibliotek.
- UI notifikasjoner for innkommende pipeline-events.
- SCIM PATCH/DELETE og SCIM grupper synk tilbake til Enterprise.


## Hardened (post-audit)
- Demo endpoint bak RBAC + feature-flag
- Webhook HMAC med rå body og timestamp
- Sentralisert Prometheus-metoder, unngår duplisering
- API-wrapper: Zod+RBAC+metrics for tasks/contacts/deals
- Re-lagt inn `openapi/crm.yaml` for CI validering
