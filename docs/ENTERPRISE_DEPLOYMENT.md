# Enterprise deployment – Intune, Jamf, Linux

Denne guiden viser maler og praksis for utrulling av **WorkBuoy Desktop** på tvers av OS, samt anbefalt policy for kanaler og rollback.

## Kanaler & versjonering
- **Kanal**: `stable` (default) og `beta`
- **Artefaktnavn**: `WorkBuoy_${version}_${os}_${arch}.${ext}`
- **Rollback**:
  1. Stans publisering til `stable`
  2. Promoter forrige versjon til `stable`
  3. Sett `WB_AUTOUPDATE=false` midlertidig via MDM hvis nødvendig

---

## Windows (Intune)

### Pakk MSI til .intunewin
1. Hent `WorkBuoy_<versjon>_win_*.msi` fra build-artefakter.
2. Bruk Microsoft Win32 Content Prep Tool for å lage `.intunewin`.
3. Bruk **install/uninstall**-kommandoene under.

### Installeringsskript (PowerShell)
`mdm/intune/install.ps1`:
```powershell
param(
  [string]$MsiPath = "WorkBuoy_1.0.0_win_x64.msi",
  [string]$UpdateUrl = "https://updates.company.com/workbuoy/stable",
  [string]$Channel = "stable",
  [string]$AutoUpdate = "true"
)
$arguments = "/i `"$MsiPath`" /qn"
Start-Process msiexec.exe -ArgumentList $arguments -Wait -NoNewWindow
# App config i registry (per machine)
New-Item -Path HKLM:\Software\WorkBuoy -Force | Out-Null
Set-ItemProperty -Path HKLM:\Software\WorkBuoy -Name WB_UPDATE_URL -Value $UpdateUrl
Set-ItemProperty -Path HKLM:\Software\WorkBuoy -Name WB_UPDATE_CHANNEL -Value $Channel
Set-ItemProperty -Path HKLM:\Software\WorkBuoy -Name WB_AUTOUPDATE -Value $AutoUpdate
exit 0
```

### Deteksjonsskript
`mdm/intune/detect.ps1`:
```powershell
$exists = Test-Path "C:\Program Files\WorkBuoy Desktop\WorkBuoy Desktop.exe"
if ($exists) { exit 0 } else { exit 1 }
```

### Avinstallasjon
```
msiexec /x {PRODUCT-CODE-GUID} /qn
```

---

## macOS (Jamf)

### Konfigurasjons-plist
`mdm/jamf/com.workbuoy.desktop.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>WB_UPDATE_URL</key><string>https://updates.company.com/workbuoy/stable</string>
  <key>WB_UPDATE_CHANNEL</key><string>stable</string>
  <key>WB_AUTOUPDATE</key><true/>
</dict>
</plist>
```

### Distribusjon
1. Bygg `.dmg` eller `.pkg` via `npm run dist`.
2. Last opp til Jamf og legg ved profilen over (Configuration Profile).
3. Sett **Custom Settings** med `com.workbuoy.desktop`.

---

## Linux (systemd + repo)

### systemd-unit
`mdm/linux/workbuoy-desktop.service`:
```
[Unit]
Description=WorkBuoy Desktop
After=network-online.target

[Service]
Type=simple
Environment=WB_UPDATE_URL=https://updates.company.com/workbuoy/stable
Environment=WB_UPDATE_CHANNEL=stable
Environment=WB_AUTOUPDATE=true
ExecStart=/opt/workbuoy-desktop/workbuoy-desktop
Restart=on-failure

[Install]
WantedBy=default.target
```

### APT-repo snippet
`/etc/apt/sources.list.d/workbuoy.list`:
```
deb [arch=amd64] https://repo.company.com/workbuoy stable main
```

### Installasjon
```bash
sudo apt update && sudo apt install workbuoy-desktop
sudo systemctl enable --now workbuoy-desktop.service
```

---

## Sikkerhet og telemetry
- Sett `WB_UPDATE_URL` til en HTTPS-feed; signer artefakter for macOS/Windows.
- OTEL-eksport i backend settes i `values-prod.yaml` (Helm).

## Feilsøking
- Windows: `Event Viewer` + Intune logg
- macOS: `Console.app` og `~/Library/Logs`
- Linux: `journalctl -u workbuoy-desktop`
