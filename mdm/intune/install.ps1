param(
  [string]$MsiPath = "WorkBuoy_1.0.0_win_x64.msi",
  [string]$UpdateUrl = "https://updates.company.com/workbuoy/stable",
  [string]$Channel = "stable",
  [string]$AutoUpdate = "true"
)
$ErrorActionPreference = "Stop"
$arguments = "/i `"$MsiPath`" /qn"
Start-Process msiexec.exe -ArgumentList $arguments -Wait -NoNewWindow

New-Item -Path HKLM:\Software\WorkBuoy -Force | Out-Null
Set-ItemProperty -Path HKLM:\Software\WorkBuoy -Name WB_UPDATE_URL -Value $UpdateUrl
Set-ItemProperty -Path HKLM:\Software\WorkBuoy -Name WB_UPDATE_CHANNEL -Value $Channel
Set-ItemProperty -Path HKLM:\Software\WorkBuoy -Name WB_AUTOUPDATE -Value $AutoUpdate

exit 0
