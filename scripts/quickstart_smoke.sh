#!/usr/bin/env bash
set -euo pipefail

export BASE_URL=${BASE_URL:-http://127.0.0.1:45860}
export API_KEY=${API_KEY:-dev}
export TENANT_ID=${TENANT_ID:-t1}

echo "== Start mock CRM =="
node scripts/mock_crm_api.js &
MOCK_PID=$!
trap "kill $MOCK_PID" EXIT
sleep 0.8

echo "== JS CRUD =="
pushd examples/js >/dev/null
npm ci
node crm_crud.js | tee /dev/stderr | grep -q "Created:"
popd >/dev/null

echo "== Python CRUD =="
pushd examples/python >/dev/null
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt -q
python crm_crud.py | tee /dev/stderr | grep -q "Created:"
deactivate
popd >/dev/null

echo "== Desktop offline→sync =="
node desktop_demo/offline_sync_demo.js | tee /dev/stderr | grep -q "Sync report:"

echo "OK: Quickstart smoke PASS"
