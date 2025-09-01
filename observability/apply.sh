#!/usr/bin/env bash
set -euo pipefail
# Example apply (replace with your ops tooling)
kubectl apply -f observability/alerts/workbuoy_alerts.yaml
# Grafana dashboards import via API/UI, documented in observability/README.md
echo "Alert rules applied"
