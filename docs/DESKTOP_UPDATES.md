# Desktop Auto-Update – kanaler & diff-oppdateringer (PR AG)

Denne PR-en konfigurerer auto-update med **kanaler** (`stable`/`beta`) og **differensielle oppdateringer** (blockmap).

## Konsepter
- **Channel** bestemmes av `WB_UPDATE_CHANNEL` (env) og `publish.url` i `electron-builder.yml`.
- **Generic provider**: statisk HTTP(S)-feed som eksponerer `latest.yml` (Windows/nsis), `latest-mac.yml` (macOS), og artefakter.
- **Diff updates**: nsis/dmg/zip genererer blockmap som muliggjør delta-nedlastinger.

## Lokal test
1. Bygg pakker:
```bash
cd desktop
npm ci
npm run build
WB_UPDATE_CHANNEL=beta npm run dist
```
2. Legg artefakter + `latest*.yml` i `mock_feed/beta/` og start mock:
```bash
WB_UPDATE_CHANNEL=beta npm run update:mock
# feed: http://127.0.0.1:4000
```
3. Start appen med:
```bash
WB_UPDATE_URL=http://127.0.0.1:4000 WB_UPDATE_CHANNEL=beta electron .
```

## CI-publisering
- Workflow: `.github/workflows/desktop-updates.yml`
- Secrets: `FEED_UPLOAD_URL` (HTTP PUT-endpoint) og `FEED_UPLOAD_TOKEN` (Bearer).

## Rollback
- Promoter forrige versjon ved å overskrive `latest*.yml` i kanalen og peke til tidligere artefakter.
- Alternativt: sett klienter midlertidig til `WB_UPDATE_CHANNEL=stable` via MDM-policy.

## Tips
- Ha separate buckets/paths per kanal: `/workbuoy/stable/` og `/workbuoy/beta/`.
- Sett lang cache på artefakter, kort cache på `latest*.yml`.
