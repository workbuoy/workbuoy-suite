# PR J: MDM-profiler + silent install + policy

## Endringsplan
- `desktop/src/policy.ts` – Policy loader fra OS-spesifikke kilder.
- `deployment/intune/prepare_intunewin.ps1` – Script for Intune .intunewin.
- `deployment/jamf/com.workbuoy.desktop.mobileconfig` – Jamf profil.
- `deployment/linux/policy.json` – Linux policy sample.
- `docs/MDM_DEPLOYMENT.md` – Dokumentasjon.

## Testing
- Windows: kjør `.msi /quiet`, bekreft regkey.
- macOS: installer `.pkg`, last inn `.mobileconfig`, bekreft plist.
- Linux: legg policy til `/etc/workbuoy/policy.json`, start app.

## Rollback
- Fjern MDM-profiler (Intune unassign, Jamf remove config profile, rm policy.json).
