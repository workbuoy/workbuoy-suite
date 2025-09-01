# META System (AI builds AI)

This document describes the Meta-System components added in the roadmap-complete build.

## Components
- `lib/meta/analyzer.js` — scans the project tree and returns code stats and simple heuristics (TODO/FIXME counts, large files).
- `lib/meta/planner.js` — converts analyzer output + recent audit events into a feature roadmap.
- `lib/meta/rollback.js` — snapshot & restore. Snapshots are stored under `.wb_snapshots/` and exclude `node_modules/`.

## API
- `GET /api/meta/analyze` — project stats
- `GET /api/meta/plan` — generated roadmap items
- `POST /api/meta/rollback` — `{ action: 'snapshot'|'restore'|'list', file?, label? }`

## Safety
- All rollbacks operate on zip snapshots that can be diffed and removed safely.
- Rollback must be human-approved in Tsunami mode (flag-gated).

## Usage
```bash
curl -X GET http://localhost:8080/api/meta/analyze
curl -X GET http://localhost:8080/api/meta/plan
curl -X POST http://localhost:8080/api/meta/rollback -H 'content-type: application/json' -d '{"action":"snapshot","label":"pre-release"}'
```