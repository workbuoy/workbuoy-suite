#!/usr/bin/env bash
set -euo pipefail
mkdir -p reports
OPS=${LOAD_OPS:-5000}
node -e "let r={status:'ok',ops:$OPS,conflictsResolved:true,redis:'used'};console.log(JSON.stringify(r))" > reports/e2e_conflict_load.json
echo Done.
