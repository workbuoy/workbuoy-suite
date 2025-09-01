# Release-prosess (Phase C)

## Kanaler
- **beta**: tidlige builds for QA
- **latest** (stable): produksjon

Sett `WB_UPDATE_CHANNEL` i miljø/CI for å velge kanal.

## Signering / Notarisering
- macOS: krever Apple Developer ID og App Specific Password, samt Team ID.
- Windows: last opp PFX (base64) og sett `CSC_LINK` og `CSC_KEY_PASSWORD`.
- Linux: AppImage/DEB/RPM pakkes; signering valgfritt.

## CI (GitHub Actions)
- Ved tag: bygg + signer + last opp artefakter (.dmg/.exe/.AppImage) til Release (draft hvis ønsket).
- Nightly: bygg smoke-artefakter uten signering.

## Rollback
- Opprett ny tag på forrige fungerende versjon og sett `WB_ALLOW_DOWNGRADE=1` i miljøet for å tillate nedgradering, kun midlertidig.

## QA – Phase D (AI/CRM)
- Overlay åpnes/lukkes med Cmd/Ctrl+Shift+B; chat returnerer svar fra `/ai/chat`.
- CRM-varsler vises i tråd med toggles (deals/tickets/møter/wb2wb).
- Offline viser deals/tickets/møter og markerer konflikter.
- Metrics viser AI-requests, CRM-notifs og offline-conflicts.


## QA – Phase E
- **Offline create**: opprett deal mens offline → vises i Queued Writes → ved nett blir `synced`.
- **Konflikt**: endre samme entitet lokalt/remote → marker `KONFLIKT` → løs med Behold lokalt / Overskriv → teller `wb_desktop_crm_conflict_resolutions_total`.
- **AI workflows**: hent forslag via overlay-fanen → vises og kan kopieres.
- **Settings**: toggles påvirker oppførsel og lagres.
- **Metrics**: nye tellere synlige på `/metrics`.


## QA – Phase F
- Assistant Mode: flertrinns chat; “Apply to CRM” legger patch i queue og synces online.
- E-post: `wb:email:draft` enqueues draft (qtype=email) → synces i bakgrunnen når online.
- Kalender: `wb:calendar:create` enqueues event (qtype=calendar) → synces når online.
- Metrics: sessions/email/calendar-økning synlig på `/metrics`.
- Telemetry: opt-in må aktiveres; ingen PII logges.


## QA – Phase G
- Build workflow i overlay: `Workflows`-fanen → Preview → Run → se queue (wf_id) → synkroniseres sekvensielt.
- Settings → velg org → nye queue-entries tagges med aktiv `org_id`; `/metrics` viser orgs_total og org_switches_total.
- Plugins → enable Google Calendar → health-check OK; disable → metrics oppdateres; feil øker `wb_desktop_plugin_health_failures_total`.
- Telemetry (opt-in) sender kun aggregerte tellinger (ingen PII).


## CI-matrise og secrets
- `release.yml` bygger på **macOS/Windows/Linux**; release feiler hvis `WB_SECRETS_KEY` mangler.
- Legg inn signeringsnøkler i GitHub Secrets. Windows-signering: erstatt "Signing stub" med signtool & cert.

## QA sjekkliste (hardening)
- Start i prod uten `WB_SECRETS_KEY` → forventet terminering med feilmelding.
- CSP: åpne workflows/gallery; ingen `unsafe-inline` brudd i DevTools.
- Kjør E2E: `npm run test:e2e` → smoke passerer.


## Release assets
- Publiser `integrations/manifest/*.json` sammen med binær-artefakter.
## QA (utdrag)
- Plugins: enable → blokkert ved invalid signatur; badge i UI.
- Audit: generér 3 events → se queuestørrelse og status i metrics.
- RBAC: handlinger uten policy → nektet.
- CRDT pilot (tenant-flag) → resolutions/latency i metrics.
- Dash: åpne → metrics snapshot vises.


## Manifester og sjekksummer
Release-workflow publiserer nå `integrations/manifest/*.json` og `dist/checksums.txt` som release assets.
