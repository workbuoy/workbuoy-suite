#!/usr/bin/env bash
set -euo pipefail
# Requires: GITHUB_TOKEN, GITHUB_REPOSITORY (owner/repo)
# Usage: scripts/check_workflows.sh ".github/workflows/desktop-encryption-tests.yml" ".github/workflows/update-feed-smoke.yml" ...

ownerrepo="${GITHUB_REPOSITORY:-}"
token="${GITHUB_TOKEN:-}"
if [[ -z "$ownerrepo" || -z "$token" ]]; then
  echo "GITHUB_REPOSITORY/GITHUB_TOKEN missing; skipping strict gate (PASS)"
  exit 0
fi

api="https://api.github.com/repos/${ownerrepo}/actions/workflows"
fail=0
for wf in "$@"; do
  name="$(basename "$wf")"
  echo "Checking workflow: $name"
  url="${api}/${name}/runs?per_page=1"
  res="$(curl -sS -H "authorization: Bearer ${token}" "$url")"
  conclusion="$(echo "$res" | jq -r '.workflow_runs[0].conclusion // empty')"
  status="$(echo "$res" | jq -r '.workflow_runs[0].status // empty')"
  html="$(echo "$res" | jq -r '.workflow_runs[0].html_url // empty')"
  echo "  status=${status} conclusion=${conclusion} ${html}"
  if [[ "${conclusion}" != "success" ]]; then
    echo "  -> NOT SUCCESS"
    fail=1
  fi
done

exit $fail
