#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-update_repo}"
BASE_URL="${2:-http://127.0.0.1:45900}"
mkdir -p "$REPO/stable" "$REPO/beta" "$REPO/artifacts"

# Create placeholder artifacts
echo "stable 1.0.0" > "$REPO/artifacts/WorkBuoy-Desktop-1.0.0.zip"
echo "beta 1.0.1-beta.1" > "$REPO/artifacts/WorkBuoy-Desktop-1.0.1-beta.1.zip"
# Optional delta "patch" artifacts
echo "delta 1.0.0->1.0.1-beta.1" > "$REPO/artifacts/WorkBuoy-Desktop-1.0.0_to_1.0.1-beta.1.delta"

# Compute fake sha512 (of contents) base64
sha512_b64() {
  if command -v sha512sum >/dev/null 2>&1; then
    local sum=$(sha512sum "$1" | awk '{print $1}')
    # hex to base64
    python3 - <<PY "$sum"
import sys, binascii, base64
h=sys.argv[1]
b=binascii.unhexlify(h)
print(base64.b64encode(b).decode())
PY
  else
    echo ""
  fi
}

STABLE_ART="WorkBuoy-Desktop-1.0.0.zip"
BETA_ART="WorkBuoy-Desktop-1.0.1-beta.1.zip"
STABLE_SHA=$(sha512_b64 "$REPO/artifacts/$STABLE_ART")
BETA_SHA=$(sha512_b64 "$REPO/artifacts/$BETA_ART")

cat > "$REPO/stable/latest.json" <<JSON
{
  "channel": "stable",
  "version": "1.0.0",
  "url": "$BASE_URL/artifacts/$STABLE_ART",
  "sha512": "$STABLE_SHA",
  "notes": "Initial GA release.",
  "delta": []
}
JSON

cat > "$REPO/beta/latest.json" <<JSON
{
  "channel": "beta",
  "version": "1.0.1-beta.1",
  "url": "$BASE_URL/artifacts/$BETA_ART",
  "sha512": "$BETA_SHA",
  "notes": "Beta build with fixes.",
  "delta": [{
    "from": "1.0.0",
    "url": "$BASE_URL/artifacts/WorkBuoy-Desktop-1.0.0_to_1.0.1-beta.1.delta"
  }]
}
JSON

echo "Mock updates created in $REPO"
