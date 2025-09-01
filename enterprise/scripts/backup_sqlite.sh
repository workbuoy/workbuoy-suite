#!/usr/bin/env bash
set -euo pipefail
OUT="${1:-./backups}"
mkdir -p "$OUT"
cp db/workbuoy.db "$OUT/workbuoy-$(date +%F).db"
echo "Backup written to $OUT"
