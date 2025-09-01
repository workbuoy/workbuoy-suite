#!/usr/bin/env bash
set -euo pipefail
CHANNEL="${WB_UPDATE_CHANNEL:-stable}"
FEED_URL="${FEED_UPLOAD_URL:-}"
TOKEN="${FEED_UPLOAD_TOKEN:-}"
if [[ -z "${FEED_URL}" || -z "${TOKEN}" ]]; then
  echo "FEED_UPLOAD_URL / FEED_UPLOAD_TOKEN not set; skipping upload." >&2
  exit 0
fi

shopt -s nullglob
for f in desktop/dist_electron/*; do
  b=$(basename "$f")
  echo "Uploading $b to $FEED_URL/$CHANNEL/"
  curl -fsSL -X PUT -H "Authorization: Bearer $TOKEN" --upload-file "$f" "$FEED_URL/$CHANNEL/$b"
done
echo "Upload finished."
