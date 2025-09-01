# WorkBuoy Desktop – Final Ready Guide

## Offline & Sync
- Full sync-queue med retry/backoff og sekvensiell workflow-behandling (wf_id).
- Konflikter: **Last-Write-Wins** som standard, audit-logg; CRDT-strategi kan kobles via `conflict.setStrategy()`.
- Cross-device: roaming av assistant/workflow drafts + Settings via kryptert lagring (se `roaming.js`, `secrets.js`).

## Auth & RBAC
- OIDC mot Enterprise-portalen (OIDC i portal + cookie/bearer-bridging i main).
- RBAC synk: `GET /rbac/me` lagres i `electron-store` og brukes for UI-gating.

## Plugin-markedsplass
- Statisk registry for first-party adapters (mock). Signering & versjonskontroll kan håndheves via `tweetnacl` i en senere PR.
- Feature-flagg + health-check i Settings og i Plugin Marketplace-vindu.

## Dyp AI-analyse
- Background pipeline (`ai-insights.js`) samler aggregerte tellinger pr org og kan synkes til backend.
- Dashboards planlegges rendret i Next.js (`ui/`).

## Observability
- Metrics: `wb_desktop_sync_total`, `wb_desktop_conflicts_total`, `wb_desktop_plugins_total{status}`, `wb_desktop_ai_jobs_total{status}`.
- OTEL tracing via `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` eller `WB_OTEL_TRACES_URL`.

## Logging & Security
- `logger.js` maskerer PII og erstatter direkte `console.*` der vi har instrumentert.
- Audit-logg sendes til backend via `/audit` når tilgjengelig.

## Packaging & CI/CD
- `electron-builder` konfig for macOS/Windows/Linux.
- GitHub Actions for lint, test, build og release (se `.github/workflows`).

## Tester
- Jest unit: queue, conflict, plugins, ai-insights.
- Playwright E2E: offline→sync→konfliktløst; plugin install/uninstall; AI-innsikt; login→roaming.


## Hardening-krav (prod)
- Appen nekter å starte i **production** uten `WB_SECRETS_KEY`.
- CSP i lokale HTML tillater ikke `'unsafe-inline'` (CSS/JS flyttet til filer).


## Plugin-signering
- Ved enabling verifiseres manifest (ed25519 + sha256). Ugyldig/unsigned blokkeres.
## Audit-logging
- Audit-events persisteres i `audit_queue` og pushes med retry/backoff. Se metrics `wb_desktop_audit_push_total{status}`.
## RBAC-gates
- Renderer spør `wb:rbac:can` før sensitive handlinger. Policy lastes fra `/rbac/me`.
## Dashboards
- Eget Dash-vindu med streng CSP. Henter metrics snapshot via IPC.
