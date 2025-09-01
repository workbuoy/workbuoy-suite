# Desktop Build & Signing

## CI/CD
- GitHub Actions matrix builds for Windows, macOS, Linux (`.github/workflows/desktop-build.yml`).
- Artifacts lastes opp per OS.

## Signing & Notarization
- **macOS**: krever Apple Developer ID, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`.
- **Windows**: krever sertifikat (.pfx) og passord (`WINDOWS_CERT_FILE`, `WINDOWS_CERT_PASSWORD`).
- **Linux**: `.deb`, `.rpm` kan signeres med GPG (`LINUX_GPG_KEY`, `LINUX_GPG_PASSPHRASE`).

## Auto-update
- Konfigurert via `electron-builder.yml` + `electron-updater`.
- Bruker generic provider: `https://updates.workbuoy.local/<channel>`.

## QA-test
1. Last ned artefakter fra GitHub Actions.
2. Installer `.msi`, `.dmg`, `.deb` osv.
3. Start app, bekreft versjon `0.1.0`.
4. Endre `CHANNEL=beta`, kjør auto-update smoke.
