# Meta Foundation Flow

1. **docgen** produces or updates docs (README, ARCHITECTURE) from repo facts.
2. **planner** emits `services/planner/subtasks/*.yaml` describing small, low-risk changes.
3. **builder (proposal-only)** reads subtasks and generates `patch.diff` limited by allowlist.
4. **human review** is mandatory for PRs labeled `ai-proposal`.
5. **kill-switch**: set `AI_BUILDER_ENABLED=false` to force a no-op.

All meta artifacts are logged to `meta/decision-log.jsonl` (append-only).
