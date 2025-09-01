# PR J: MDM-profiler + silent install + policy

## Endringsplan
- **Policy loader**: `desktop/src/policy/*`
- **Intune**: `mdm/intune/*.ps1` (prepare, install, detection)
- **Jamf**: `mdm/jamf/WorkBuoy.mobileconfig`
- **Linux**: `mdm/linux/policy.json`, `workbuoy.service.d/override.conf`
- **Docs**: `docs/MDM_DEPLOYMENT.md`
- **CI**: `.github/workflows/mdm-artifacts.yml` – laster opp MDM-prøver

## Test (lokalt)
- Windows: kjør `install.ps1 -Silent` i en test-VM og verifiser regkeys.
- macOS: installer `WorkBuoy.pkg`, legg til profilen med `profiles` eller Jamf.
- Linux: legg `/etc/workbuoy/policy.json` og start app; verifiser policy lastes.

## Rollback
- Fjern/disable MDM-policy-distribusjon i Intune/Jamf. Appen faller tilbake til miljøvariabler.
