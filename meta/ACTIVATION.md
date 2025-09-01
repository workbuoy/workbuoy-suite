# Meta Activation (Proposal-Only)

1) Ensure `services/builder/policies/allowlist.yaml` includes only docs/tests/scripts.
2) Set env `AI_BUILDER_ENABLED=true` (or omit to default allow).
3) Run the meta workflow (docgen → planner → builder). Review PRs with label `ai-proposal`.
4) Kill-switch any time: `AI_BUILDER_ENABLED=false`.

All actions are logged to `meta/decision-log.jsonl`.
