#!/usr/bin/env bash
set -euo pipefail
# Install deps elsewhere (CI), then:
node scripts/sqlcipher_probe.js
( cd desktop && npm run build )
# Signing/notarization happen via sanitized scripts and CI secrets
echo "Desktop build completed"
