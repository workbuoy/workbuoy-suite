#!/usr/bin/env bash
set -euo pipefail
if [[ $# -lt 1 ]]; then echo "Usage: $0 <image-ref>"; exit 1; fi
IMG="$1"
cosign verify-attestation   --type "slsa-provenance"   --certificate-identity-regexp "https://github.com/.+/.+/.github/workflows/.+@.+"   --certificate-oidc-issuer "https://token.actions.githubusercontent.com"   "$IMG"
