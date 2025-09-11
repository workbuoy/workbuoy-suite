# Release guide (MVP → Beta)

1. Merge superdrop PR to `main` (no bypass).
2. Ensure Actions green:
   - backend-ci ✅
   - openapi-lint ✅
   - coverage-report ✅ (≥80%)
3. Tag release:
   ```bash
   git tag v2.0.0
   git push origin v2.0.0
   ```
4. (Optional) Promote to staging with Docker/Helm.
