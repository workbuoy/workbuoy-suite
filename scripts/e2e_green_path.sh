#!/usr/bin/env bash
set -euo pipefail

export BASE_URL=${BASE_URL:-http://127.0.0.1:45870}
export API_KEY=${API_KEY:-dev}
export TENANT_ID=${TENANT_ID:-t1}

mkdir -p reports

echo "== Start Mock Suite API =="
node scripts/mock_suite_api.js &
API_PID=$!
trap "kill $API_PID" EXIT
sleep 1

echo "== Desktop offline→sync =="
node desktop_demo/offline_sync_demo.js > reports/desktop_sync.json
cat reports/desktop_sync.json

echo "== Connector simulators (SF + Dynamics) =="
node scripts/mock_connector_ingest.js > reports/connector_push.json
cat reports/connector_push.json

echo "== Compliance export =="
JOB=$(curl -s -X POST -H 'content-type: application/json' -d '{"userId":"e2e_user"}' "$BASE_URL/api/v1/compliance/export" | jq -r .jobId)
STATUS=$(curl -s "$BASE_URL/api/v1/compliance/export/$JOB")
echo "$STATUS" > reports/compliance_export.json
WEBHOOKS=$(curl -s "$BASE_URL/_admin/webhooks")
echo "$WEBHOOKS" > reports/webhooks.json

echo "== Metrics =="
MET=$(curl -s "$BASE_URL/metrics")
echo "$MET" > reports/metrics.txt

# Parse checks
desktop_ok=$(jq -r '.sync_report.after' reports/desktop_sync.json)
conn_metrics_sf=$(grep -E '^sf_ingest_total ' reports/metrics.txt | awk '{print $2}')
conn_metrics_dyn=$(grep -E '^dyn_ingest_total ' reports/metrics.txt | awk '{print $2}')
dlq_sf=$(grep -E '^sf_dlq_total ' reports/metrics.txt | awk '{print $2}')
dlq_dyn=$(grep -E '^dyn_dlq_total ' reports/metrics.txt | awk '{print $2}')
exp_status=$(jq -r '.status' reports/compliance_export.json)
exp_url=$(jq -r '.url' reports/compliance_export.json)
wh_started=$(jq -r '[.[] | select(.event=="privacy.export.started")] | length' reports/webhooks.json)
wh_completed=$(jq -r '[.[] | select(.event=="privacy.export.completed")] | length' reports/webhooks.json)

jq -n --argjson desktop_after "$desktop_ok"       --argjson sf_ingest "$conn_metrics_sf"       --argjson dyn_ingest "$conn_metrics_dyn"       --arg dlq_sf "$dlq_sf"       --arg dlq_dyn "$dlq_dyn"       --arg exp_status "$exp_status"       --arg exp_url "$exp_url"       --argjson wh_started "$wh_started"       --argjson wh_completed "$wh_completed" '{
  desktop_sync_ok: ($desktop_after == 0),
  connector_sf_ingest_gt0: ($sf_ingest | tonumber) > 0,
  connector_dyn_ingest_gt0: ($dyn_ingest | tonumber) > 0,
  dlq_clear: (($dlq_sf|tonumber) == 0 and ($dlq_dyn|tonumber) == 0),
  compliance_export_completed: ($exp_status == "complete" and ($exp_url|length) > 0),
  webhooks_ok: ($wh_started > 0 and $wh_completed > 0)
}' > reports/e2e_green.json

cat reports/e2e_green.json

# Fail if any check false
fail=$(jq -r '[ to_entries[] | select(.value==false) ] | length' reports/e2e_green.json)
if [[ "$fail" != "0" ]]; then
  echo "E2E GREEN failed checks:"
  jq -r 'to_entries[] | select(.value==false) | "- " + .key' reports/e2e_green.json
  exit 1
fi

echo "E2E GREEN PASS"
