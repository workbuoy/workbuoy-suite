# PR Summary — SaaS self‑service onboarding & connectors

**Ikke-teknisk kortversjon**
- La til selvbetjent onboarding med «Velg systemer» + **Koble til alle**.
- Integrasjonskatalog med statusmerker (**Koblet / Venter på IT / Ikke koblet**) og tydelig «Krever IT?». 
- Auto-oppdag/suggestions bruker eksisterende scan og foreslår Microsoft/Google m.fl.
- Egen IT-side for admin-samtykke: hva som skjer, hvordan godkjenne/angre.
- Alltid synlig banner + forbedret /portal/info med tydelige råd.
- «Last ned desktop»-knapp og **desktop/**-skjelett (Electron) med README.

**Teknisk**
- Nye API-endepunkt: `POST /api/integrations/list`, `POST /api/integrations/connect-all`, `GET /api/integrations/status`, `GET /api/integrations/admin-consent-link`.
- Utvidet metrics (`prom-client`): `wb_onboarding_started_total`, `wb_onboarding_completed_total`, `wb_integration_connect_total{provider,status}`, `wb_admin_consent_requests_total{provider}`.
- Audit: connect/disconnect/consent logges via eksisterende audit-pipe (DB/file WORM).
- Nye sider: `/portal/onboarding/systems`, `/portal/onboarding/admin-consent`, forbedret `/portal/connectors`, oppdatert `/portal/info` og `/portal`.
- Oppdatert `public/config/integrations.catalog.json` med full katalog + IT-krav.
- Tester: Unit (katalog/status/consent-link/connect-all) + E2E (Playwright – onboarding systems).
- Dokumentasjon: `docs/ONBOARDING.md`, `docs/CONNECTORS_CATALOG.md`, `desktop/DESKTOP_README.md`.
- `.env.example` utvidet med relevante nøkler og desktop dev-URL.

**Krav som krever IT-samtykke**
- Microsoft 365 (org-scope), Google Workspace org-delegation, ERP/HR (Workday, BambooHR, SAP, Infor, NetSuite) og ofte Zendesk/JSM.


---


# PR Summary — Dev Ready SaaS/Enterprise (final pass)

## Ikke-teknisk
- Enterprise-klar plattform: RBAC + Admin-UI, SSO (OIDC prod, SAML skeleton), SCIM skeleton, PII/retensjon, bedre status & audit, dashboards/alerts, Helm & CI.
- Minst to “real” areas løftet: Workday (real-skeleton) og SharePoint (delta-hardening). Jira/BambooHR allerede real.

## Teknisk høydepunkter
- **DB/Migrations**: user_roles, audit_log WORM-felt, pii_policy, retention_policy, scim_*, connector_state utvidelser.
- **RBAC**: admin CRUD på brukere; seed-first-admin script.
- **SSO**: OIDC med nonce/state + JWKS cache; SAML metadata/ACS skeleton.
- **SCIM v2**: Users/Groups CRUD, soft delete, audit + metrics.
- **PII/Retensjon**: sentral masking, retention job + admin API, DSR erase stub.
- **Connectors**: Workday real-skeleton, SharePoint delta cursor persist.
- **Status/Onboarding**: resync endpoint/knapp, wizard-oppgraderinger.
- **Observability**: nye Prometheus-metrikker, Grafana dashboard + Alertmanager regler.
- **Helm/CI**: TLS/values for OIDC/SAML, CodeQL/Trivy/ZAP.
- **API**: OpenAPI v3 skeleton.
- **Tester**: Jest unit (PII/RBAC) + Playwright E2E (SCIM/status).

## ENV (utdrag)
- `DATABASE_URL` (PG) eller `DB_PATH` (SQLite dev)
- `APP_JWT_SECRET`
- OIDC: `AZUREAD_CLIENT_ID/SECRET`, `OKTA_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `OIDC_REDIRECT_URI`
- Connectors: `WORKDAY_BASE`, `WORKDAY_TOKEN`, (SharePoint bruker MS Graph creds via eksisterende oppsett)


### Real-ifying stubs — oppsummering
- **NetSuite/Infor/Qlik/Workday** gjort “real” med robuste fetchers, incremental og backoff (der relevant).
- **SharePoint**: delta-hardening lagt til som egen connector variant.
- **SAML**: signaturverif + metadata.
- **SCIM**: filter/paginering/ETag og gruppe-medlemskap.
- **Jobs**: resync/erasure via queue (BullMQ eller in-memory).
- **Secrets**: provider-abstraksjon.
- **OpenAPI**: utvidet med nye endpoints.
- **Tester**: Jest + Playwright for nøkkelflyt.


### full_ready
- API v1 prefiks, OpenAPI utvidet, Swagger UI-side.
- API Keys + Developer Portal UI.
- Webhooks (signert) + test-endepunkt.
- Rate limiting & idempotens (middleware for v1).
- Mock server + Postman/Insomnia artefakter.
- SDK skjelett (JS/Python) + eksempler.

- Redis-basert rate limiting med planoppslag
- OpenTelemetry init (OTLP via ENV)
- Webhooks via BullMQ + retry/DLQ og portal-historikk
- API keys med Argon2id + rotasjon
- OpenAPI utvidet og Swagger UI oppdatert


### final_polish_all-in
- OpenAPI 100% dekning (smoke-validated), Swagger UI oppdatert
- SDK generering scripts & CI-validering
- Redis limiter prod-klar m/ planoppslag; idempotens TTL script
- Webhooks BullMQ med retry/DLQ + portal-historikk/redo
- OTEL init + dashboards/alerts placeholders
- SBOM/cosign placeholders; governance (CODEOWNERS/CONTRIBUTING/Renovate)
- k6 smoke
