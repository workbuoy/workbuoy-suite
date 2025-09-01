# Detection rule: app version from registry
$path = "HKLM:\Software\WorkBuoy"
$name = "Version"
try {
  $val = (Get-ItemProperty -Path $path -Name $name).Version
  if ($val) { exit 0 } else { exit 1 }
} catch { exit 1 }
