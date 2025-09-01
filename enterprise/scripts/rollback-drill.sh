#!/usr/bin/env bash
set -euo pipefail

# Rollback Drill for SQLite (default). For Postgres/MySQL, adapt accordingly.
# Requires: sqlite3 CLI available in PATH.

DB_PATH="${DB_PATH:-db/workbuoy.db}"
SNAP_DIR="${SNAP_DIR:-./backups}"
SNAP_FILE="$SNAP_DIR/wb-rollback-$(date +%s).db"

echo "[1/5] Verifying sqlite3 availability..."
command -v sqlite3 >/dev/null 2>&1 || { echo "sqlite3 not found in PATH"; exit 1; }

echo "[2/5] Taking DB snapshot of $DB_PATH -> $SNAP_FILE"
mkdir -p "$SNAP_DIR"
if [ ! -f "$DB_PATH" ]; then
  echo "Database not found at $DB_PATH. Running bootstrap migrations..."
  npm run migrate
fi
cp "$DB_PATH" "$SNAP_FILE"

echo "[3/5] Applying test migration..."
sqlite3 "$DB_PATH" "CREATE TABLE IF NOT EXISTS _wb_rollback_test (id INTEGER PRIMARY KEY, ts TEXT DEFAULT CURRENT_TIMESTAMP);"
sqlite3 "$DB_PATH" ".tables" | grep -q "_wb_rollback_test" && echo "Test table created."

echo "[4/5] Rolling back by restoring snapshot..."
cp "$SNAP_FILE" "$DB_PATH"

echo "[5/5] Verifying baseline restored..."
if sqlite3 "$DB_PATH" ".tables" | grep -q "_wb_rollback_test"; then
  echo "ERROR: rollback failed: _wb_rollback_test still present."
  exit 1
fi

echo "Rollback drill SUCCESS. Snapshot at: $SNAP_FILE"
