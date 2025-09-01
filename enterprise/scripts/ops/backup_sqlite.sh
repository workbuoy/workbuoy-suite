#!/usr/bin/env bash
set -euo pipefail
OUT=${1:-backup_$(date +%Y%m%d_%H%M%S).tar.gz}
tar -czf "$OUT" db/
echo "Backup skrevet: $OUT"
