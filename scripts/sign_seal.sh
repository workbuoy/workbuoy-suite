#!/usr/bin/env bash
set -euo pipefail
SEAL="${1:-reports/seal.json}"
if [[ -z "${GPG_PRIVATE_KEY:-}" ]]; then
  echo "No GPG_PRIVATE_KEY provided; skipping signing."
  exit 0
fi
echo "$GPG_PRIVATE_KEY" | base64 -d | gpg --batch --import
if [[ -n "${GPG_PASSPHRASE:-}" ]]; then
  gpg --batch --yes --pinentry-mode loopback --passphrase "$GPG_PASSPHRASE" --detach-sign -o "${SEAL}.asc" "$SEAL"
else
  gpg --batch --yes --detach-sign -o "${SEAL}.asc" "$SEAL"
fi
echo "Signature written to ${SEAL}.asc"
