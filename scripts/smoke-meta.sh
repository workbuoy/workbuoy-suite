#!/usr/bin/env bash
set -euo pipefail

curl -fsS http://localhost:8080/api/meta/health >/dev/null
curl -fsS http://localhost:8080/api/meta/version >/dev/null

if [ -n "${META_TOKEN:-}" ]; then
  curl -fsS -H "Authorization: Bearer ${META_TOKEN}" http://localhost:8080/api/meta/readiness >/dev/null
else
  printf 'META_TOKEN not set; skipping /api/meta/readiness (requires meta:read).\n'
fi

printf 'META smoke check passed.\n'
