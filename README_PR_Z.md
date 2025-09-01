# PR Z: Enterprise deployment docs + Quickstart

## Endringsplan
- **Quickstart**: `docs/QUICKSTART.md` – fra lokal dev til prod
- **Enterprise Deployment**: `docs/ENTERPRISE_DEPLOYMENT.md` – Intune/Jamf/Linux
- **MDM-artefakter**:
  - Intune: `mdm/intune/install.ps1`, `mdm/intune/detect.ps1`
  - Jamf: `mdm/jamf/com.workbuoy.desktop.plist`
  - Linux: `mdm/linux/workbuoy-desktop.service` + APT snippet i docs
- **CI**: `.github/workflows/docs-check.yml` – link-check for docs (npx markdown-link-check)

## Test-kommandoer
```bash
# Link-check lokalt
cd docs
npm ci
npm run links
```

## Manuell validering
- Intune: pakk MSI → .intunewin, bruk `install.ps1` og `detect.ps1`
- Jamf: last opp .pkg + legg ved plist som Custom Settings
- Linux: legg til repo, installer og aktiver systemd-service

## Rollback
- Dokumentasjon – ingen runtime-endringer; revert PR ved behov.
