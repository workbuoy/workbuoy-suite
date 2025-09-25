#!/usr/bin/env bash
set -euo pipefail
# Optional normalize step:
ROLES_JSON_PATH=$(node -p "require.resolve('@workbuoy/roles-data/roles.json')")

if [ -f tools/roles/normalize_roles.py ]; then
  python3 tools/roles/normalize_roles.py "$ROLES_JSON_PATH" packages/roles-data/roles.normalized.json || true
fi
# Validation (requires node deps if validator exists)
if [ -f core/roles/validate_roles.js ]; then
  node core/roles/validate_roles.js
elif [ -f tests/roles/test_roles_schema.py ]; then
  python3 -m pytest -q tests/roles/test_roles_schema.py
else
  echo "No validator found; ensure roles gate exists"; exit 1
fi
echo "Roles gate OK"
