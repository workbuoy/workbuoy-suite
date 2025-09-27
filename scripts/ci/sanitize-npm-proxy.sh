#!/usr/bin/env bash
set -euo pipefail

# Remove legacy npm config key that triggers warnings
npm config delete http-proxy || true

# Unset env variants that npm parses as "env config"
unset npm_config_http_proxy || true
unset npm_config_http-proxy || true  # hyphenated variant sometimes appears
unset NPM_CONFIG_HTTP_PROXY || true
unset http_proxy || true
unset HTTP_PROXY || true

# Leave valid keys (proxy / https-proxy) intact if a CI proxy is actually used.
echo "[sanitize-npm-proxy] Active npm proxy config after cleanup:"
npm config get proxy || true
npm config get https-proxy || true
