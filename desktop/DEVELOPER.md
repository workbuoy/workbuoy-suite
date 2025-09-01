
# DEVELOPER — Auth & Sync, IPC, DB

## Arkitektur
- **Main**: oppretter vinduer, tray, auto-update, IPC, settings og deep links.
- **Background (main-prosess modul)**: periodisk sync mot API, SQLite-cache.
- **Renderer**: SaaS-portal (BrowserWindow) + små lokale views (settings/offline).
- **Auth-bridge**: `auth-bridge.js` henter cookies/bearer fra portal-origin (main), ikke eksponert til renderer.

## IPC-kontrakter
- `wb:getSettings` → { startAtLogin, notificationsEnabled, syncIntervalSec, portalOrigin, version }
- `wb:updateSettings` (patch) → validerer og lagrer, oppdaterer timer i background.
- `wb:offline:getMessages` → { ok, items: [...] }
- `wb:notify` (fire-and-forget) → viser native varsler (respekt for settings).

## Sync-flow
1. `background.start()` åpner DB, kjører første sync etter 10s, og planlegger løpende sync med `schedule()`.
2. `getAuthContext()` henter cookieHeader (+ ev. bearer) for API-kall (samme origin).
3. `fetchJSON()` gjør kall med headers; retry/backoff ved feil.
4. `upsert(table, rows)` lagrer JSON payload (inkl. `updated_at`) i SQLite.
5. Metrics oppdateres for hvert endepunkt.

## DB-skjema
Tabeller: `messages`, `customers`, `calendar`, `tasks`  
Kolonner: `id TEXT PRIMARY KEY`, `updated_at INTEGER`, `payload TEXT`  
Migrasjoner gjøres idempotent ved oppstart (kan senere flyttes til `db/migrations/*.sql`).

## Sikkerhetstiltak
- Renderer får ikke tilgang til cookies/tokens.
- CSP på lokale HTML-filer.
- Ingen eval/dynamiske imports i renderer.
- All input via IPC valideres (grenser og typer).

## Konfig (env)
- `WB_PORTAL_BASE_URL` (default: https://app.workbuoy.com/portal)
- `WB_API_BASE_URL` (default: https://app.workbuoy.com/api)
- `WB_SYNC_POLL_SEC` (default: 300)
- `WB_METRICS_PORT` (default: 9464)
- `WB_UPDATE_INTERVAL_MIN` (default: 60)


## Phase B: Auth fornyelse og Sync-detaljer
- `auth-bridge.js` fornyer kortlivede tokens via cookie (`/auth/refresh`) i main-prosess og cacher `access_token` med utløp.
- `background.js` henter auth-context (`cookieHeader`/`bearer`) med flagg `WB_PREFER_BEARER`.
- Paginering: query `?limit=<PAGE_SIZE>&cursor=<cursor>` forventes; alternativt 304 via ETag/Last-Modified.
- Metrics: pages, rate-limits, token-renews, varighet per endepunkt.
- Settings styrer `WB_SYNC_PAGE_SIZE`, `WB_SYNC_CONCURRENCY`, prefer bearer, og eksterne lenker.

## Nye IPC-endepunkt
- (uendret) `wb:getSettings`, `wb:updateSettings`, `wb:offline:getMessages` — utvidet respons inkluderer `syncPageSize`, `preferBearerToken`, `externalLinks`.

## Test
- `tests/e2e/basic.spec.mjs` kjører en enkel Electron-oppstart og verifiserer vindustittel. Utvid denne til deep-links/offline når mock-API er på plass.



## Phase C: Distribusjon, Crash & Logging
- **Signering/Notarisering**: electron-builder leser standard env/Secrets (CSC_*, APPLE_*). macOS krever hardened runtime + entitlements.
- **Sentry**: init i `crash.js`, kun aktiv hvis `SENTRY_DSN` satt. Uncaught/unhandled fanges.
- **Logger**: `logger.js` maskerer PII (JWT, Bearer, epost), roterer filer, JSON-modus via env. Bruk `require('./logger').create('channel')` i stedet for `electron-log` direkte.
- **Kanaler**: sett `WB_UPDATE_CHANNEL=beta|latest` for update-kanal. Publisering skjer til GitHub Releases.


## Phase D: Mini-Buoy & CRM
- **Overlay**: `renderer/overlay` + IPC `wb:overlay:toggle`. Preload eksponerer `aiChat(messages)` → main kaller `/ai/chat` med cookies/bearer i headers.
- **CRM Sync**: nye tabeller `deals/tickets/meetings`; konflikt detekteres ved `updated_at` < lokalt → settes `conflicted=1` og metric økes.
- **CRM Varsler**: `background` sender native `Notification` for nye/oppdaterte CRM-elementer; respekterer toggles i `electron-store`.
- **Offline**: `wb:offline:getList` IPC → generic lesing fra ønsket tabell.
- **Metrics**: AI-requests, CRM-notifikasjoner, offline-konflikter.


## Phase E: Offline-first & AI-workflows
### Sync-queue
- SQLite-tabell `sync_queue` holder writes (pending|inflight|failed|synced) med `attempt` og `last_error`.
- Background `processQueueOnce()` flusher kø, idempotent via `op_id = queue.id`, backoff+jitter på feil.
- Konflikter (409/412) markerer rad som `conflicted=1` og lar UI løse via IPC `wb:queue:resolveConflict`.

### IPC-kontrakter
- `wb:queue:create({ entity, op, entityId?, payload? })`
- `wb:queue:list({ status?, limit? })`
- `wb:queue:retry({ id })`
- `wb:queue:resolveConflict({ entity, entityId, resolution: 'keepLocal'|'keepServer' })`
- `wb:ai:workflow({ entity, entityId, kind })`

### Sikkerhet
- Alle API-kall skjer i main/background; renderer har kun godkjente IPC-metoder via preload.
- Input valideres i main (`validateQueueInput`) og med whitelists for entity/op/kind.
- Logger masker PII. CSP i lokale views.



## Phase F: Assistant Mode, E-post & Kalender
- **Queue-utvidelse**: `sync_queue.qtype` skiller *crm* vs *email* vs *calendar* (forenlig med tidligere CHECKs). For e-post/kalender settes `entity='task'` og `op='create'`, men ruting styres av `qtype`.
- **IPC**: `wb:email:draft`, `wb:calendar:create`, `wb:assistant:apply`. Validering i main, null hemmeligheter i renderer.
- **Konfig**: `WB_EMAIL_BASE_URL`, `WB_CAL_BASE_URL` (default `<portal-origin>/email|/calendar`).
- **Metrics**: `wb_desktop_ai_assistant_sessions_total`, `wb_desktop_email_drafts_total`, `wb_desktop_calendar_events_total`.


## Phase G – Arkitektur
### DB
- `sync_queue` utvidet med `org_id`, `wf_id`, `step_index`. Indekser på `(org_id,status,updated_at)` og `(wf_id,step_index,status)`.
- Domænetabeller har `org_id` for per-org cache og spørringer.

### Workflow manifest
```json
{ "orgId": "org_123", "steps": [ { "qtype":"crm","entity":"deal","op":"update","entityId":"d1","payload":{ } }, { "qtype":"email","payload":{ } } ] }
```
- Enqueues atomisk med `wf_id`. Bakgrunnsarbeid låser opp neste trinn når forrige er `synced`.

### Integrasjoner
- `integrations/index.js` registrerer adaptere statisk. Hver adapter tilbyr `enabled/enable/health/apply`.
- **Ingen dynamisk eval**. Adaptere bundlet ved build.

### IPC
- `wb:workflow:run`, `wb:org:list`, `wb:org:switch`, `wb:plugins:list`, `wb:plugins:toggle`, `wb:plugins:health` (validering i `main.js`).
- Preload eksporterer wrappers. Renderer har aldri tokens.

### Sikkerhet
- `contextIsolation`, `sandbox`, streng CSP i lokale HTML.
- PII-maskering og org-tagging i logger.


## IPC-validering med Zod
Alle kanaler er validert i `main.js` via Zod-skjemaer. Ugyldige kall avvises og måles i `invalid_ipc_total`.

## DB bootstrap (idempotent migrasjon)
`db/bootstrap.js` sikrer kolonner/indekser (005/006) via `PRAGMA table_info(...)` før `ALTER TABLE`. Kjøres ved DB-oppstart.

## E2E offline→flush
Se `tests/e2e/offline-sync-conflict.spec.mjs` – mock-API startes i testen. Testen er røyk/smoke og kan utvides.


## Plugin-manifest & signering
Manifest: `integrations/manifest/<key>.json` med feltene `key, version, integrity, signature, publicKey`. Verifiseres i `integrations/signature.js`.
## Audit Queue
`audit_queue` tabell + worker i `background.js`. Backoff og metrics.
## CRDT Pilot
`crdt/strategy-pilot.js` kobles via `conflict.setStrategy()` når `WB_CRDT_TENANTS` er satt.
## IPC
Nye: `wb:rbac:can`, `wb:metrics:snapshot`. Validering med Zod beholdes for øvrige.


## RBAC-enforcement i main
Sensitive IPC (workflow/email/calendar/plugins) kaller `assertAllow(action, resource)` før de utføres. Avviste kall øker `invalid_ipc_total`.

## Audit backoff/lås/sanitering
Audit-kø bruker `earliest_at` + eksponentiell backoff m/jitter, og global lås under flush. Payload saniteres før persist/send.

## Plugin verify API
IPC `wb:plugins:verify({key})` bruker `integrations/index.verifyAdapter()` og brukes i Plugin Marketplace for riktig badge.
