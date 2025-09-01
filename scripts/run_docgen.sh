#!/usr/bin/env bash
set -euo pipefail
# Assumes Node 20 available
node tools/docgen/docgen.ts
echo "Docgen completed; commit changes via your CI PR step."
