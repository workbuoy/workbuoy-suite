#!/usr/bin/env bash
set -euo pipefail
: "${API_BASE_URL:?}"
curl -fsSL "$API_BASE_URL/api/healthz" >/dev/null
curl -fsSL "$API_BASE_URL/api/readyz"  >/dev/null
curl -fsSL "$API_BASE_URL/api-docs/openapi.yaml" | head -n 5 >/dev/null
echo "SaaS health/readyz/openapi OK"
