# WorkBuoy Desktop (Electron) — Scaffold

Dette er skallet for skrivebordsappen. Installer-filer bygges ikke nå.

## Arkitektur

- **Electron main** (desktop/main.mjs): starter en BrowserWindow som laster WorkBuoy web (`/pages/portal`), bruker samme SSO (OIDC) via innebygd systemnettleser.
- **Preload** (desktop/preload.mjs): sikker bro for varsler, bakgrunns-sync og dyp lenking.
- **Renderer** (desktop/renderer/index.html): enkel placeholder.

## Pålogging

Appen åpner WorkBuoy i et innebygd vindu. Ved SSO sendes brukeren til IdP i standard nettleser. Etter innlogging kommer man tilbake via deep link `workbuoy://auth/callback` (registreres av appen). Token lagres i OS Keychain.

## Auto-update (senere)

- Bruk electron-updater mot en privat release-feed.
- Signering: macOS Developer ID, Windows Code Signing.
- Rullering: kanarifugl via kanal (beta/stable).

## Systemvarsler og bakgrunnssync (senere)

- Varsler: `new Notification()` fra preload, bak kontrollert API.
- Bakgrunn: bruk `powerSaveBlocker` + planlagt jobb for å hente kalender/e-post og sende lokale varsler.
- Offline cache: IndexedDB i renderer, synk ved nett.

## Kommandoer

```bash
# Kjør i dev (uten auto-update, kun web shell)
npm run desktop:dev

# Bygg senere (krever å legge til electron/electron-builder)
npm run desktop:build
```

Se også **/docs/DESKTOP_README.md** for mer detaljer.
