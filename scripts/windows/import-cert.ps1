param(
  [Parameter(Mandatory=$true)][string]$CertBase64,
  [Parameter(Mandatory=$true)][string]$CertPassword
)
$bytes = [System.Convert]::FromBase64String($CertBase64)
$tempPfx = Join-Path $env:TEMP "wb_ev_cert.pfx"
[System.IO.File]::WriteAllBytes($tempPfx, $bytes)
Import-PfxCertificate -FilePath $tempPfx -CertStoreLocation Cert:\LocalMachine\My -Password (ConvertTo-SecureString -String $CertPassword -AsPlainText -Force) | Out-Null
Write-Host "Certificate imported."
