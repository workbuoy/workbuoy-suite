$exists = Test-Path "C:\Program Files\WorkBuoy Desktop\WorkBuoy Desktop.exe"
if ($exists) { exit 0 } else { exit 1 }
