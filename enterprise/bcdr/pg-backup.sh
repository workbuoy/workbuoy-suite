#!/usr/bin/env bash
set -euo pipefail
# scripts/bcdr/pg-backup.sh
# Requires pg_dump and AWS/GCS CLI configured.
: "${DATABASE_URL:?set DATABASE_URL}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT=${OUT:-backups/pg-${STAMP}.sql.gz}
mkdir -p "$(dirname "$OUT")"
pg_dump "$DATABASE_URL" | gzip -9 > "$OUT"
echo "Backup written to $OUT"
