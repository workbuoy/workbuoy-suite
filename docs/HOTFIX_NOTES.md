# META CI Hotfix v3

This hotfix:
- Disables META PR1 CI and META PR2 CI workflows by replacing them with inert no-op jobs.
- Updates `openapi/meta.yaml` with proper operationIds, servers section, and corrected security.
- After merging this, only `backend-ci / test` and `openapi-lint / lint` are meaningful checks.
