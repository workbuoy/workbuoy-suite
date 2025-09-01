# Convert MSI to .intunewin
param([string]$Installer="WorkBuoy.msi")
Write-Output "Converting $Installer to IntuneWin package..."
# requires IntuneWinAppUtil.exe
IntuneWinAppUtil -c . -s $Installer -o . -q
