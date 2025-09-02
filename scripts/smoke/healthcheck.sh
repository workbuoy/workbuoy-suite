#!/usr/bin/env bash
set -euo pipefail
BASE="${API_BASE_URL:-http://localhost:3000}"
curl -fsS "${BASE}/api/healthz" | grep -q '"ok": *true' && echo "OK"
