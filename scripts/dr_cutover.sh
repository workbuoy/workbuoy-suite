#!/usr/bin/env bash
set -euo pipefail

ns_active="wb-active"
ns_passive="wb-passive"

kubectl create namespace "$ns_active" || true
kubectl create namespace "$ns_passive" || true

echo "== Deploy ACTIVE region"
helm upgrade --install workbuoy ops/helm/workbuoy -n "$ns_active" -f ops/helm/overlays/active/values.yaml
kubectl rollout status deploy/workbuoy -n "$ns_active" --timeout=120s

echo "== Deploy PASSIVE region"
helm upgrade --install workbuoy ops/helm/workbuoy -n "$ns_passive" -f ops/helm/overlays/passive/values.yaml
kubectl rollout status deploy/workbuoy -n "$ns_passive" --timeout=120s

echo "== Simulate region outage (ACTIVE -> scale 0)"
t_fail_start=$(date +%s%3N)
kubectl scale deploy/workbuoy -n "$ns_active" --replicas=0
kubectl rollout status deploy/workbuoy -n "$ns_active" --timeout=60s || true

echo "== Cutover: promote PASSIVE (scale up to 2, mark primary=true via helm)"
helm upgrade --install workbuoy ops/helm/workbuoy -n "$ns_passive" -f ops/helm/overlays/passive/values.yaml --set replicaCount=2 --set region.primary=true
kubectl rollout status deploy/workbuoy -n "$ns_passive" --timeout=120s
t_cutover_end=$(date +%s%3N)

duration_ms=$((t_cutover_end - t_fail_start))
mkdir -p reports
cat > reports/dr_cutover.json <<JSON
{
  "outage_start_ms": $t_fail_start,
  "cutover_end_ms": $t_cutover_end,
  "cutover_duration_ms": $duration_ms,
  "active_scaled_to_zero": true,
  "passive_promoted": true
}
JSON

echo "== DR Cutover Report =="
cat reports/dr_cutover.json
