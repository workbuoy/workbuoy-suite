#!/usr/bin/env bash
set -euo pipefail
REPO="${1:-update_repo}"
BASE_URL="${2:-http://127.0.0.1:45910}"
mkdir -p "$REPO/stable" "$REPO/beta" "$REPO/artifacts"

echo "stable 1.0.1" > "$REPO/artifacts/WorkBuoy-Desktop-1.0.1.zip"
echo "stable 1.0.0" > "$REPO/artifacts/WorkBuoy-Desktop-1.0.0.zip"
echo "beta 1.1.0-beta.1" > "$REPO/artifacts/WorkBuoy-Desktop-1.1.0-beta.1.zip"

sha512_b64() {
  if command -v sha512sum >/dev/null 2>&1; then
    local sum=$(sha512sum "$1" | awk '{print $1}')
    python3 - <<PY "$sum"
import sys, binascii, base64
h=sys.argv[1]; b=binascii.unhexlify(h); print(base64.b64encode(b).decode())
PY
  else
    echo ""
  fi
}

STABLE_L=WorkBuoy-Desktop-1.0.1.zip
STABLE_P=WorkBuoy-Desktop-1.0.0.zip
BETA_L=WorkBuoy-Desktop-1.1.0-beta.1.zip

SL=$(sha512_b64 "$REPO/artifacts/$STABLE_L")
SP=$(sha512_b64 "$REPO/artifacts/$STABLE_P")
BL=$(sha512_b64 "$REPO/artifacts/$BETA_L")

cat > "$REPO/stable/latest.json" <<JSON
{ "channel":"stable", "version":"1.0.1", "url":"$BASE_URL/artifacts/$STABLE_L", "sha512":"$SL", "notes":"Stable 1.0.1", "delta":[] }
JSON
cat > "$REPO/stable/prev.json" <<JSON
{ "channel":"stable", "version":"1.0.0", "url":"$BASE_URL/artifacts/$STABLE_P", "sha512":"$SP", "notes":"Stable 1.0.0", "delta":[] }
JSON
cat > "$REPO/beta/latest.json" <<JSON
{ "channel":"beta", "version":"1.1.0-beta.1", "url":"$BASE_URL/artifacts/$BETA_L", "sha512":"$BL", "notes":"Beta 1.1.0-beta.1", "delta":[] }
JSON

echo "Rollout repo created in $REPO"
