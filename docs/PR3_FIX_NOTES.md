# PR3: Conflict + CI Fix

Use this patch on the PR3 branch to:
- Disable legacy META workflows (PR1/PR2) for this branch (no `pull_request` trigger).
- Sync `openapi/meta.yaml` with main (hotfix v3) to resolve conflict and satisfy openapi-lint.

Steps:
1) In PR3 page, click "•••" → "Edit" ensure target branch is this PR's branch.
2) "Add file" → "Upload files" → upload the **contents** of this zip.
3) Commit directly to the PR branch.
4) If "Resolve conflicts" still appears for `openapi/meta.yaml`, open the web editor and keep the uploaded version.
5) Re-run checks — only backend-ci/openapi-lint should remain relevant.
