# Meta Route Runbook (ZIP-only mode)

This archive is a *meta branch* built on top of your finished product.
It introduces *opt-in* meta capabilities without altering runtime code.

## What was added
- META_ROUTE_README.md
- meta/decision-log.jsonl, meta/usage-log.jsonl and schemas
- scripts/meta_record.sh
- tools/docgen/*
- services/planner/* (allowlist, policies, subtasks)
- services/builder/* (proposal-only, docs/tests/scripts scope)
- .github/workflows/meta-foundation.yml

## How to use locally (no GitHub required)
1) Install Node 20 locally.
2) From the repo root (unzipped):
   - Docgen (generate updated README):
     ```bash
     npm ci || true
     node tools/docgen/docgen.ts
     ```
   - Planner (generate subtasks):
     ```bash
     node services/planner/planner.ts
     ```
   - Builder (create a patch for README, proposal-only):
     ```bash
     git init && git add . && git commit -m "baseline"
     node services/builder/builder.ts
     # A file 'patch.diff' is created; apply it to a branch if you want:
     git checkout -b chore/ai-proposal || true
     git apply --index patch.diff && git commit -m "ai: proposal (docs/tests/scripts only)"
     ```

## Notes
- The original finished repo files are preserved.
- If a starter file had the same name, the starter copy was saved as '*.metaadd' next to it.
- The GitHub workflow is provided for later use; it is harmless when the repo is used locally.
