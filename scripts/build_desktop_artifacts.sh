#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
OUT="${1:-dist}"
mkdir -p "$OUT/mac" "$OUT/linux"

# macOS .app structure (placeholder)
APP_DIR="$OUT/mac/WorkBuoy Desktop.app"
mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources"
echo -e '#!/usr/bin/env bash\necho "WorkBuoy Desktop placeholder app"' > "$APP_DIR/Contents/MacOS/WorkBuoy"
chmod +x "$APP_DIR/Contents/MacOS/WorkBuoy"
cat > "$APP_DIR/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleName</key><string>WorkBuoy Desktop</string>
  <key>CFBundleIdentifier</key><string>com.workbuoy.desktop</string>
  <key>CFBundleVersion</key><string>1.0.0</string>
  <key>CFBundleExecutable</key><string>WorkBuoy</string>
</dict></plist>
PLIST
(cd "$OUT/mac" && zip -qry "../WorkBuoy-Desktop-mac.zip" "WorkBuoy Desktop.app")

# Linux tarball placeholder
echo "WorkBuoy Desktop linux placeholder" > "$OUT/linux/README.txt"
tar -czf "$OUT/WorkBuoy-Desktop-linux.tgz" -C "$OUT/linux" .

echo "Artifacts created under $OUT"
