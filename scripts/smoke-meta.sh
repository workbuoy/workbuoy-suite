#!/usr/bin/env bash
set -euo pipefail

curl -fsS http://localhost:8080/api/meta/health >/dev/null
curl -fsS http://localhost:8080/api/meta/version >/dev/null

printf 'META smoke check passed.\n'
