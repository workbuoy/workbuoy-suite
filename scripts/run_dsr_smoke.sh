#!/usr/bin/env bash
set -euo pipefail
: "${API_BASE_URL:?}"
: "${DSR_TOKEN:?}"
python3 tools/testrunner/run_tests.py tests/privacy/dsr_smoke.yaml
