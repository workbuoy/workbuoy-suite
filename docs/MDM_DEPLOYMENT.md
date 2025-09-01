# MDM-deployment – WorkBuoy Desktop

## Silent install-flagg
### Windows (MSI)
```powershell
msiexec /i WorkBuoy-x64.msi CHANNEL=Stable APIBASEURL=https://api.workbuoy.local /qn /norestart
```
- Detection rule (Intune): se `mdm/intune/detection.ps1` (leser `HKLM\Software\WorkBuoy\Version`)

### macOS (PKG)
```bash
sudo installer -pkg WorkBuoy.pkg -target /
```
- Policy styres av Jamf-profilen `WorkBuoy.mobileconfig`

### Linux (.deb/.rpm/.AppImage)
```bash
sudo DEBIAN_FRONTEND=noninteractive dpkg -i workbuoy_0.1.0_amd64.deb || sudo apt -f install -y
# eller
sudo rpm -i workbuoy-0.1.0.x86_64.rpm
```
- Policy: `/etc/workbuoy/policy.json`

## Intune (Windows)
1. Pakk MSI til `.intunewin` med `mdm/intune/prepare.ps1` (krever IntuneWinAppUtil).
2. Installerkommando: `powershell.exe -ExecutionPolicy Bypass -File install.ps1 -MsiPath WorkBuoy-x64.msi -Channel Stable -ApiBaseUrl https://api.workbuoy.local -Silent`
3. Uninstall-kommando: `msiexec /x {PRODUCT-CODE-GUID} /qn`
4. Detection rule: bruk `detection.ps1` eller fil-/regkey-sjekk.
5. Policy-regkeys (eksempel):
   - `HKLM\Software\WorkBuoy\ApiBaseUrl`
   - `HKLM\Software\WorkBuoy\AutoUpdateChannel`
   - `HKLM\Software\WorkBuoy\TelemetryEnabled`

## Jamf (macOS)
- Last opp `mdm/jamf/WorkBuoy.mobileconfig` og knytt til smart groups.
- Endre verdier i profilen for miljø (dev/stage/prod).

## Linux (policy + systemd)
- Kopiér `mdm/linux/policy.json` til `/etc/workbuoy/policy.json`.
- (Valgfritt) legg til `mdm/linux/workbuoy.service.d/override.conf` under `/etc/systemd/system/workbuoy.service.d/`.

## Policy loader i appen
- Appen leser policy:
  - Windows: `HKLM\Software\WorkBuoy` (regkeys)
  - macOS: `defaults read com.workbuoy.desktop`
  - Linux: `/etc/workbuoy/policy.json`
- Miljøvariabler overstyrer alltid policy (se `desktop/src/policy/loader.ts`).

## Telemetri og proxy
- Aktiver/avaktiver telemetri via policy eller `TELEMETRY_ENABLED=0` miljøvariabel.
- Proxy støttes via policy (`ProxyURL`) eller `HTTP(S)_PROXY` env.

## Sikkerhet
- Ingen hemmeligheter i repo. Sertifikater/notarization håndteres via CI-secrets.
