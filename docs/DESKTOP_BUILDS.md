# Desktop builds + auto-update + notifications

## Forutsetninger
- Node 20+, Yarn/NPM
- macOS: Xcode command-line tools (for å bygge .dmg/.pkg). Uten signering får du "app kommer fra en ukjent utvikler" – se Gatekeeper bypass.
- Windows: Bygg .msi uten signering er støttet; for distribusjon anbefales sertifikat.
- Linux: Deb/RPM/AppImage bygges uten signering som standard.

## Bygg lokalt
```bash
cd desktop
npm ci
npm run dist
# artefakter under desktop/release/
```

## Auto-update
- Sett `WB_UPDATE_URL` til din oppdateringsfeed (Generic server, f.eks. S3/NGINX)
- Valgbar kanal via `WB_UPDATE_CHANNEL` (`stable`|`beta`)
- Skru av via `WB_AUTOUPDATE=false`

## Varsler (OS notifications)
- Via Electrons `Notification` API (native på Win/macOS/Linux).
- Test i appen: "Test notification"-knappen.

## Signering
- macOS: sett `CSC_IDENTITY_AUTO_DISCOVERY=false` for unsigned; for signering: sett `CSC_NAME`, Apple ID env, og aktiver notarization.
- Windows: sett `CSC_LINK` og `CSC_KEY_PASSWORD` hvis tilgjengelig.
- Linux: optional GPG for .deb/.rpm repos.

## Artefaktnavn
- `WorkBuoy_${version}_${os}_${arch}.${ext}` (definert i `electron-builder.yml`).

## Kanalpublisering
- `electron-builder` kan publisere til Generic server/S3/GitHub Releases. I denne PR brukes **publish: generic** med `WB_UPDATE_URL`.
