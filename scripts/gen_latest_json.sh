#!/usr/bin/env bash
set -euo pipefail
VERSION=${1:?semver}
FILE=${2:?path to artifact}
URL=${3:-"https://updates.workbuoy.io/workbuoy/stable/$(basename "$FILE')"}

SHA=$(sha512sum "$FILE" | awk '{print $1}')
SIZE=$(stat -c%s "$FILE" 2>/dev/null || stat -f%z "$FILE")
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > latest.json <<JSON
{
  "version": "$VERSION",
  "files": [ { "url": "$URL", "sha512": "$SHA", "size": $SIZE } ],
  "path": "workbuoy/stable",
  "releaseDate": "$DATE"
}
JSON
echo "Wrote latest.json"
