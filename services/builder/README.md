# Builder (Proposal-Only)

- Reads `services/planner/subtasks/*.yaml`.
- Generates a small `patch.diff` affecting ONLY allowlisted paths (docs/tests/scripts).
- Opens PR with label `ai-proposal` (when run in CI).
- Requires human review; cannot auto-merge.
- Kill-switch: `AI_BUILDER_ENABLED=false` to disable.

## Local dry-run (optional)
```
git init && git add . && git commit -m "baseline"
node services/builder/builder.ts
# patch at services/builder/proposals/patch.diff
```
