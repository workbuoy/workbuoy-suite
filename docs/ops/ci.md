# CI Rails – Quick Checklist

## Required settings (GitHub → Settings)
- Rulesets → `Work`: **Require status checks** = only `backend-ci`
- Actions → General → Workflow permissions = **Read and write permissions**
- Branch requires **≥1 approval** (review) and linear history (optional)

## Workflows kept
- `.github/workflows/backend-ci.yml`
- `.github/workflows/auto-merge.yml`
- `.github/workflows/smoke-open-pr.yml`

## End-to-end test
1) Actions → smoke-open-pr → **Run workflow** (branch: main)
2) Open PR from log line `PR URL:`
3) Label `automerge` (already set) → **Approve** PR
4) Wait for **backend-ci** green → PR auto-merges (squash)
