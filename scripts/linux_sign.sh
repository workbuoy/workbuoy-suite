#!/usr/bin/env bash
set -euo pipefail
ART_DIR="${1:-dist}"
cd "$ART_DIR"
shopt -s nullglob
: > SHA256SUMS.txt
for f in *.tgz *.deb *.rpm *.AppImage; do
  [ -f "$f" ] && sha256sum "$f" >> SHA256SUMS.txt
done
if [ -n "${GPG_PRIVATE_KEY:-}" ]; then
  echo "$GPG_PRIVATE_KEY" | base64 -d | gpg --batch --import
  gpg --batch --yes --detach-sign --armor -o SHA256SUMS.txt.asc SHA256SUMS.txt
  echo "GPG signature created: SHA256SUMS.txt.asc"
else
  echo "GPG key not provided; only checksums emitted."
fi
