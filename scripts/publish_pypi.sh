#!/bin/bash
# Publish WorkBuoy Python SDK to PyPI
set -euo pipefail
if [ -z "${PYPI_API_TOKEN:-}" ]; then
  echo "PYPI_API_TOKEN is not set"; exit 1
fi
cd sdk/python
python3 setup.py sdist bdist_wheel
python3 -m twine upload dist/* -u __token__ -p $PYPI_API_TOKEN
