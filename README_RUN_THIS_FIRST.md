# First steps after applying ci_bootstrap_patch

1. Commit and push these files to your `main` branch (or upload via GitHub UI).
2. Go to GitHub → Actions → **Smoke Open PR** → Run workflow.
   - You should see a new PR titled `chore(ci): automerge smoke`.
   - This PR will be labeled `automerge` and merged automatically once checks pass.
3. Verify backend CI runs by making a small change under `backend/` and pushing.
4. Once verified, you can safely extend with Codex prompts and new features.
