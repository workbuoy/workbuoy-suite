#!/usr/bin/env bash
set -euo pipefail
ARCHIVE=${1:?Gi sti til backup tar.gz}
tar -xzf "$ARCHIVE"
echo "DB restore fullført"
