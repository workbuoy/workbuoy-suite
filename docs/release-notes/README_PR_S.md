# PR S: Desktop builds + auto-update + notifications

## Endringsplan
- **Bygg**: `electron-builder.yml` med Win (.msi), macOS (.dmg/.pkg), Linux (.deb/.rpm/AppImage)
- **Auto-update**: `electron-updater` integrert i `electron-src/main.ts` (+ IPC til renderer)
- **Varsler**: IPC-handler i main + `Notification` i renderer
- **CI**: `.github/workflows/desktop-builds.yml` – matrise for tre OS, laster opp artefakter
- **Docs**: `docs/DESKTOP_BUILDS.md` – signing, kanaler, offline installasjon

## Kommandoer
```bash
cd desktop
npm ci
npm run dist
```
Artefakter vises under `desktop/release/`.

## Manuell validering
- Start app (`npm run dev`) og klikk "Test notification".
- Sett `WB_UPDATE_URL` til en generic feed og test "Check for updates".

## Rollback
- Sett `WB_AUTOUPDATE=false` eller fjern auto-update wiring fra `main.ts`.
