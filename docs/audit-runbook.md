# Workbuoy audit runbook

This runbook explains how to regenerate the analyzer artifacts after a merge or feature drop.

## Prerequisites

- Node.js 18+ (the repo CI uses Node 20).
- Git working tree with no uncommitted changes.

## Refresh steps

1. From the repo root, run the analyzer script:
   ```bash
   node tools/analyze-workbuoy.mjs > workbuoy-analysis.json
   ```
   - The script scans the tree (skipping `node_modules`, build outputs, and `.git`).
   - JSON output is written to `workbuoy-analysis.json` and `WORKBUOY_AUDIT.md` is rewritten automatically with the current short SHA.
2. Inspect the generated files:
   - `workbuoy-analysis.json` captures pillar summaries, signal hits, and any META rails violations.
   - `WORKBUOY_AUDIT.md` renders the Markdown report with pillar coverage, Buoy ⇄ Navi notes, and the “What’s next” checklist.
3. Address any violations flagged under `violations.http_write_ops` (no git/fs writes from META HTTP handlers) before committing.
4. Stage and commit the refreshed artifacts together with any guard fixes.

## Verification

- Run the META rails guard locally to confirm the analyzer and CI agree:
  ```bash
  ./ci/policy-meta-rails.sh
  ```
- Keep Jest META guard specs (`tests/meta/**/*.test.ts`) green via `npm test` from the repo root (delegates to backend Jest).

Following this runbook keeps the audit aligned with the latest commit and ensures Buoy AI remains a single assistant behind the required META rails.
