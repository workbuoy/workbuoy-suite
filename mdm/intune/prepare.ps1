param(
  [string]$SourceFolder = ".\dist\win",
  [string]$SetupFile = "WorkBuoy-x64.msi",
  [string]$OutputFolder = ".\mdm\intune\out"
)
# Requires Microsoft Win32 Content Prep Tool (IntuneWinAppUtil.exe) in PATH
New-Item -Force -ItemType Directory -Path $OutputFolder | Out-Null
IntuneWinAppUtil.exe -c $SourceFolder -s $SetupFile -o $OutputFolder
Write-Host "Created .intunewin in $OutputFolder"
