#!/usr/bin/env bash
set -euo pipefail
mkdir -p meta
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ACTOR=${1:?actor}
ACTION=${2:?action}
RESULT=${3:?result}
CTX=${4:-"{}"}
echo "{"ts":"$TS","actor":"$ACTOR","action":"$ACTION","context":$CTX,"result":"$RESULT"}" >> meta/decision-log.jsonl
