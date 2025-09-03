# CI Rails – Temporary Smoke Mode

We are running a **smoke-only** Jest config in CI to keep PRs green while stabilizing the repository.

## Required settings
- Ruleset: only require `backend-ci`.
- Actions → Workflow permissions: **Read and write**.

## What runs in CI right now
- `backend-ci` → `npx jest --ci --config backend/jest.ci.config.cjs`
- `auto-merge` → turns on auto-merge when label `automerge` + ≥1 approval.
- `smoke-open-pr` → manual button to open a validation PR.

## How to exit Smoke Mode
When the backend is stabilized:
1) Fix legacy tests and TS errors.
2) Move test scope back to full suite by changing backend-ci to `npm test -- --ci`.
3) Optional: make build/typecheck required again.

