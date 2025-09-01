#!/usr/bin/env bash
set -euo pipefail
: "${KUBE_CONFIG:?}"
echo "$KUBE_CONFIG" | base64 -d > "$HOME/.kube/config"
VALUES="release/values/values.stage.yaml"
helm upgrade --install workbuoy-enterprise ops/helm/workbuoy -f "$VALUES" --namespace workbuoy --create-namespace
