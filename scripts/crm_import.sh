#!/usr/bin/env bash
set -euo pipefail
: "${API_BASE_URL:?}"
: "${API_KEY:?}"
CSV="${1:-samples/contacts.csv}"
IDEMP="import-$(date +%s)"
curl -fsS -X POST -H "Content-Type: text/csv"   -H "x-api-key: $API_KEY"   -H "Idempotency-Key: $IDEMP"   --data-binary "@${CSV}"   "$API_BASE_URL/api/crm/import"
echo "CRM import submitted (idempotency: $IDEMP)"
