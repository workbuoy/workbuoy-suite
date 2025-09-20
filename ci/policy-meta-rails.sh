#!/usr/bin/env bash
set -euo pipefail

echo "Checking META HTTP routes for forbidden git/fs usage..."

TARGET_FILES=$(git ls-files 'src/routes/genesis.autonomy.ts' 'backend/src/meta-evolution/routes/*.ts' 2>/dev/null || true)

if [[ -z "$TARGET_FILES" ]]; then
  echo "No META route files found; skipping check."
  exit 0
fi

FAILED=0
while IFS= read -r file; do
  if grep -nE 'git\.|fs\.' "$file" > /tmp/meta-rails-grep.txt; then
    echo "Forbidden git/fs usage detected in $file:" >&2
    cat /tmp/meta-rails-grep.txt >&2
    FAILED=1
  fi
  rm -f /tmp/meta-rails-grep.txt
done <<< "$TARGET_FILES"

if [[ $FAILED -ne 0 ]]; then
  echo "META rails policy failed. Remove git/fs usage from HTTP routes." >&2
  exit 1
fi

echo "META rails policy passed."
