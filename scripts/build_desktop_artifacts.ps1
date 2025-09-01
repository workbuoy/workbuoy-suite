Param([string]$OutDir="dist")
$ErrorActionPreference = "Stop"

New-Item -Force -ItemType Directory -Path $OutDir | Out-Null
$exe = Join-Path $OutDir "WorkBuoyDesktop.exe"
# create a small PE-like placeholder using powershell (not a real app, for demo/artifacts only)
Set-Content -Path $exe -Value "WorkBuoy Desktop placeholder EXE"

# Zip as distribution
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = Join-Path $OutDir "WorkBuoy-Desktop-win.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($OutDir, $zip)
Write-Host "Artifacts created at $OutDir"
