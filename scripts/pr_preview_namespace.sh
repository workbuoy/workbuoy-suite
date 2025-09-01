#!/usr/bin/env bash
set -euo pipefail
: "${KUBE_CONFIG:?}"
echo "$KUBE_CONFIG" | base64 -d > "$HOME/.kube/config"
PR="${1:?PR number}"
NS="wb-pr-$PR"
kubectl create ns "$NS" || true
helm upgrade --install wb-pr ops/helm/workbuoy -f release/values/values.stage.yaml -n "$NS"
echo "Preview at https://wb-pr-${PR}.stage.workbuoy.io"
