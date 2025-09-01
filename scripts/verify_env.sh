#!/usr/bin/env bash
set -euo pipefail
REQ=(API_BASE_URL DATABASE_URL REDIS_URL API_KEY OPENAI_API_KEY MAPBOX_TOKEN WB_SECRETS_KEY STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET SAML_METADATA_URL SCIM_BEARER_TOKEN KUBE_CONFIG)
MISS=()
for k in "${REQ[@]}"; do
  if [ -z "${!k:-}" ]; then MISS+=("$k"); fi
done
if [ ${#MISS[@]} -gt 0 ]; then
  echo "Missing required env vars:" "${MISS[@]}"; exit 1
fi
echo "All required env vars are set."
