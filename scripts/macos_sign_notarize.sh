#!/usr/bin/env bash
set -euo pipefail
APP_ZIP="${1:-dist/WorkBuoy-Desktop-mac.zip}"
BUNDLE_ID="${BUNDLE_ID:-com.workbuoy.desktop}"
TEAM_ID="${TEAM_ID:-}"
IDENTITY="${MACOS_SIGN_IDENTITY:--}"
AC_USERNAME="${AC_USERNAME:-}"
AC_PASSWORD="${AC_PASSWORD:-}"
NOTARY_TIMEOUT="${NOTARY_TIMEOUT:-300}"

# Unzip to sign
TMP="$(mktemp -d)"
unzip -q "$APP_ZIP" -d "$TMP"
APP_PATH="$(find "$TMP" -maxdepth 2 -name '*.app' | head -n1)"

# Ad-hoc sign if no identity given
if [ "$IDENTITY" = "-" ] || [ -z "$IDENTITY" ]; then
  echo "Codesign (ad-hoc)..."
  codesign --force --deep --sign - "$APP_PATH"
else
  echo "Codesign with identity: $IDENTITY"
  codesign --force --deep --sign "$IDENTITY" "$APP_PATH"
fi

# Repack zip
SIGNED_ZIP="${APP_ZIP%.zip}-signed.zip"
(cd "$TMP" && zip -qry "$OLDPWD/$SIGNED_ZIP" "$(basename "$APP_PATH")")

# Notarize if Apple credentials provided
if [[ -n "$AC_USERNAME" && -n "$AC_PASSWORD" && -n "$TEAM_ID" ]]; then
  echo "Submitting for notarization..."
  xcrun notarytool submit "$SIGNED_ZIP" --apple-id "$AC_USERNAME" --password "$AC_PASSWORD" --team-id "$TEAM_ID" --wait --timeout "$NOTARY_TIMEOUT"
  # Staple (needs the app on disk)
  xcrun stapler staple -v "$APP_PATH" || true
  # Repack stapled app
  STAPLED_ZIP="${APP_ZIP%.zip}-signed-notarized.zip"
  (cd "$TMP" && zip -qry "$OLDPWD/$STAPLED_ZIP" "$(basename "$APP_PATH")")
  echo "Output: $STAPLED_ZIP"
else
  echo "Notarization skipped (secrets missing). Output: $SIGNED_ZIP"
fi
