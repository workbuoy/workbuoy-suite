
# WorkBuoy Desktop — Phase A (Auth & Sync + Settings)

Denne leveransen utvider v1.0.0-rc1 med:
- **Auth-bridging** fra portal-sesjon → background sync (cookies/bearer).
- **Ekte sync-skjelett** med retry/backoff og SQLite-upserts.
- **Settings-vindu** (start-ved-innlogging, sync-interval, varsler).
- **Offline-view** viser cached meldinger (topp 10).
- **Metrics utvidet**: sync-varighet, cache writes, conflicts.

## Kjappstart
```bash
npm install
npm run dev
# Miljøvariabler (valgfritt):
WB_PORTAL_BASE_URL="https://app.workbuoy.com/portal" WB_API_BASE_URL="https://app.workbuoy.com/api" npm run dev
```

## Settings
Åpnes fra tray → **Innstillinger**. Lagres i `electron-store`.  
Felter: start ved innlogging, sync-interval (60–3600), varslinger.

## Offline
Når portal ikke kan lastes: `renderer/offline.html` viser cached meldinger via IPC.

## Sikkerhet
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- Auth-context leses i main via `session.cookies` og brukes kun i **background** (ikke eksponert til renderer).
- Streng CSP i settings/offline-views.

## Metrics
- `wb_desktop_sessions_total`, `wb_desktop_notifications_total`
- `wb_desktop_sync_total`, `wb_desktop_err_total`
- `wb_desktop_sync_duration_ms` (Histogram)
- `wb_desktop_cache_writes_total`, `wb_desktop_cache_conflicts_total`

## Videre
Fyll inn faktiske API-endepunkter i `background.js` (`endpoints`/`API_BASE`), og koble til portalens auth/token-policy.


## Phase B (Ekte API + Hardening + E2E)
- Ekte sync-arkitektur med paginering/cursor, ETag/If-Modified-Since, concurrency (`WB_SYNC_CONCURRENCY`) og page size (`WB_SYNC_PAGE_SIZE`).
- Auth-fornyelse via cookie → bearer (main-prosess) uten å eksponere hemmeligheter for renderer.
- Settings: sync page size, prefer bearer token, og valg for eksterne lenker (system/in-app).
- Offline-view: enkel filtrering + klar for flere entiteter (customers/tasks).
- Metrics utvidet: `wb_desktop_sync_pages_total`, `wb_desktop_sync_rate_limited_total`, `wb_desktop_token_renews_total`.
- E2E-smoke med Playwright (`npm run test:e2e`).

### Nye miljøvariabler
| Variabel | Default | Beskrivelse |
|---|---|---|
| `WB_API_BASE_URL` | `https://app.workbuoy.com/api` | Basis-URL til API |
| `WB_SYNC_PAGE_SIZE` | `100` | Antall elementer per side |
| `WB_SYNC_CONCURRENCY` | `2` | Samtidige endepunkt-kall |
| `WB_PREFER_BEARER` | `0` | Bruk bearer når mulig |
| `WB_AUTH_REFRESH_PATH` | `/auth/refresh` | Refresh-endepunkt for token |
| `WB_LOG_JSON` | `0` | Logg som JSON-linjer når `1` |

### Tester
```bash
npm run test:e2e
```



## Phase C (Distribusjon & Crash-rapportering)
- **Signering/Notarisering** via electron-builder + GitHub Releases (les secrets under).
- **Crash-rapportering** med Sentry (`SENTRY_DSN`).
- **Logging**: rotasjon (`WB_LOG_MAX_BYTES`), PII-maskering, valgfri JSON (`WB_LOG_JSON=1`).

### Secrets (GitHub Actions)
- macOS: `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, `CSC_LINK` (p12 base64), `CSC_KEY_PASSWORD`.
- Windows: `CSC_LINK` (pfx base64) og `CSC_KEY_PASSWORD`.
- Linux: ingen (AppImage/DEB/RPM signering valgfritt).

### Miljøvariabler
| Var | Beskrivelse |
|---|---|
| `WB_UPDATE_CHANNEL` | `beta` eller `latest` (stable) |
| `SENTRY_DSN` | Sentry DSN (valgfri) |
| `SENTRY_ENV` | Sentry miljø |
| `SENTRY_TRACES_SAMPLE_RATE` | 0..1 |
| `WB_LOG_JSON` | `1` for JSON-logger |
| `WB_LOG_MAX_BYTES` | maks filstørrelse før rotasjon |


## Phase D (Buoy AI & CRM)
- **Mini-Buoy overlay** (Cmd/Ctrl+Shift+B) med enkel chat mot `/ai/chat` (autentisering via main).
- **CRM-varsler**: toggles i Innstillinger for deals/tickets/møter/wb2wb.
- **Offline CRM**: viser deals/tickets/møter i offline-modus med filter og konfliktmarkering.
- **Metrics**: `wb_desktop_ai_requests_total`, `wb_desktop_crm_notifications_total`, `wb_desktop_offline_conflicts_total`.

### Nye miljøvariabler
| Var | Default | Beskrivelse |
|---|---|---|
| `WB_AI_BASE_URL` | `<PORTAL_ORIGIN>/ai` | Basis for AI-endepunkt |


## Phase E (Offline-first CRM + AI-workflows + Analytics)
- **Offline-skriving** med `sync_queue` og automatisk flush med backoff.
- **Konfliktpolicy** med `keepLocal/keepServer` og registrering i `conflict_resolutions`.
- **AI-workflows** via `/ai/workflows` med overlay-fane for forslag.
- **Settings**: toggles for offline write-sync, AI-workflows, telemetry opt-in.
- **Metrics**: `wb_desktop_ai_workflows_total`, `wb_desktop_crm_writes_total`, `wb_desktop_crm_conflict_resolutions_total`.

### Nye IPC
- `wb:queue:create|list|retry|resolveConflict`
- `wb:ai:workflow`
- `wb:telemetry:optin`



## Phase F (AI Assistant + E-post/kalender + Analytics)
- **Assistant Mode** i overlay: flertrinns samtaler, “apply-to-CRM” via queue.
- **E-post/kalender**: `wb:email:draft` og `wb:calendar:create` som offline-kø (qtype=email|calendar).
- **Telemetry/metrics**: sessions/email/calendar-tellere; opt-in telemetry.


## Phase G (AI-augmented workflows, cross-org, plugins)
- **Guided workflows** i overlay (CRM → e‑post → kalender) med preview og batch-enqueue (wf_id).
- **Cross-org**: org-velger i Settings; queue/cache tagges med `org_id` og sendes som `x-org-id` header (der API støtter).
- **Plugins**: adapter-rammeverk (`integrations/`) med toggles og health-check (HubSpot, Google Calendar, Office 365 – mock adaptere).
- **Metrics**: workflows (start/completed/failed), orgs total/switches, plugin health failures/enabled total.
