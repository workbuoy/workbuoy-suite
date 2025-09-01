#!/usr/bin/env bash
set -euo pipefail
DIR="${1:-release_artifacts}"
cd "$DIR"
shopt -s nullglob
files=(*.zip *.tgz *.dmg *.pkg *.msi *.deb *.rpm *.AppImage)
: > SHA256SUMS.txt
for f in "${files[@]}"; do
  sha256sum "$f" >> SHA256SUMS.txt
done
echo "Wrote SHA256SUMS.txt"
