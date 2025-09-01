#!/usr/bin/env bash
set -euo pipefail
: "${APPLE_ID:?missing APPLE_ID}"
: "${APPLE_TEAM_ID:?missing APPLE_TEAM_ID}"
: "${APPLE_APP_SPECIFIC_PASSWORD:?missing APPLE_APP_SPECIFIC_PASSWORD}"
: "${AC_PASSWORD:=${APPLE_APP_SPECIFIC_PASSWORD}}"
APP_PATH="${1:?path to .app or .pkg}"

xcrun notarytool submit "$APP_PATH"       --apple-id "$APPLE_ID"       --team-id "$APPLE_TEAM_ID"       --password "$AC_PASSWORD"       --wait
