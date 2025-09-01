#!/usr/bin/env bash
# Simple secret scan (heuristic). For production, use gitleaks or git-secrets.
set -euo pipefail
echo "Running lightweight secret scan..."
if git diff --cached | egrep -i '(aws_secret|api_key|client_secret|APP_JWT_SECRET|password=\w{8,})' >/dev/null; then
  echo "Possible secrets detected in staged changes. Remove or add to allowlist."
  exit 1
fi
