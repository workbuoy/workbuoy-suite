#!/usr/bin/env bash
set -euo pipefail

echo "[policy] scanning META HTTP routes for forbidden io (git/fs)"

mapfile -t files < <(git ls-files | grep -E 'apps/backend/.*/meta.*/routes|apps/backend/.*/meta-evolution/.*/routes|apps/backend/.*/meta.*/router')

if ((${#files[@]})); then
  if grep -RInE '\bgit\\.|\bfs\.' "${files[@]}"; then
    echo "::error::Forbidden io detected in META HTTP routes"
    exit 1
  fi
fi

echo "[policy] OK"
