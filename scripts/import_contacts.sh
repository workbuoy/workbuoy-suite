#!/usr/bin/env bash
set -euo pipefail
CSV=${1:-./samples/contacts.csv}
BASE=${2:-http://localhost:3000}
KEY=${3:-changeme}
while IFS=, read -r email name org; do
  if [[ "$email" == "email" ]]; then continue; fi
  curl -sS -X POST "$BASE/api/v1/crm/contacts" \
    -H "x-api-key: $KEY" -H "Content-Type: application/json" \
    -H "Idempotency-Key: $(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid)" \
    -d "{\"email\":\"$email\",\"name\":\"$name\",\"organization\":\"$org\"}" >/dev/null
done
echo "Import complete."
