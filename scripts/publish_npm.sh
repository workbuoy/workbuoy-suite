#!/bin/bash
# Publish WorkBuoy JS SDK to npm
set -euo pipefail
if [ -z "${NPM_TOKEN:-}" ]; then
  echo "NPM_TOKEN is not set"; exit 1
fi
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
cd sdk/js
npm publish --access public
