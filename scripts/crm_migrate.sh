#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?}"
# Example: adapt to your migration tool (psql, prisma, flyway, etc.)
if [ -f "crm/migrations/2025_add_geo.sql" ]; then
  psql "$DATABASE_URL" -f crm/migrations/2025_add_geo.sql
else
  echo "No example migration found; ensure your tool runs here"
fi
