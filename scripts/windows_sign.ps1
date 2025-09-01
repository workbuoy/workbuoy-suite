Param(
  [string]$Artifact="dist\WorkBuoy-Desktop-win.zip",
  [string]$ExePath="dist\WorkBuoyDesktop.exe"
)
$ErrorActionPreference = "Stop"
$PfxB64 = $env:WINDOWS_PFX
$PfxPass = $env:WINDOWS_PFX_PASSWORD
if (-not $PfxB64 -or -not $PfxPass) {
  Write-Host "Windows signing skipped (secrets missing)"
  exit 0
}
$tempPfx = Join-Path $env:TEMP "wb.pfx"
[IO.File]::WriteAllBytes($tempPfx, [Convert]::FromBase64String($PfxB64))

Write-Host "Import PFX to user store"
$cert = Import-PfxCertificate -FilePath $tempPfx -Password (ConvertTo-SecureString -String $PfxPass -AsPlainText -Force) -CertStoreLocation Cert:\CurrentUser\My

Write-Host "Sign EXE using signtool"
$timestampUrl = "http://timestamp.digicert.com"
& signtool sign /fd SHA256 /tr $timestampUrl /td SHA256 /n $cert.Subject $ExePath

Write-Host "Repack zip after signing"
if (Test-Path $Artifact) { Remove-Item $Artifact -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory("dist", $Artifact)
Write-Host "Signed artifacts ready"
