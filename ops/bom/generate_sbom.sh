#!/usr/bin/env bash
set -euo pipefail
OUT_DIR="${1:-sbom}"
mkdir -p "$OUT_DIR"
if command -v syft >/dev/null 2>&1; then
  syft packages dir:. -o cyclonedx-json > "$OUT_DIR/sbom.cdx.json"
  syft packages dir:. -o spdx-json > "$OUT_DIR/sbom.spdx.json"
else
  echo "syft not found; install from https://github.com/anchore/syft"
  exit 1
fi
echo "SBOMs written to $OUT_DIR"
