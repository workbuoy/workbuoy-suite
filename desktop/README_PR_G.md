# PR G: Desktop build-matrise + signering/notarization

## Kjøring lokalt
```bash
cd desktop
npm ci
npx electron-builder --config electron-builder.yml --mac
```

## CI
- Workflow: `.github/workflows/desktop-build.yml`
- Bygger for Windows, macOS, Linux
- Laster opp artefakter per OS

## Secrets
- macOS: `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`
- Windows: `WINDOWS_CERT_FILE`, `WINDOWS_CERT_PASSWORD`
- Linux: `LINUX_GPG_KEY`, `LINUX_GPG_PASSPHRASE`
