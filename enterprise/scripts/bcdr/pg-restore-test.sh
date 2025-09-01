#!/usr/bin/env bash
set -euo pipefail
# scripts/bcdr/pg-restore-test.sh
: "${DATABASE_URL:?set DATABASE_URL}"
: "${BACKUP_FILE:?set BACKUP_FILE}"
createdb --if-not-exists wb_restore_test || true
gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
echo "$(date +%s)" > /tmp/wb_backup_last_success_timestamp
