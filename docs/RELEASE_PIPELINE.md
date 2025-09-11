# Release pipeline

- Bygg Docker-image på tag `vX.Y.Z` (se `.github/workflows/release.yml`), push til GHCR.
- Helm chart i `deploy/helm/workbuoy`.
- Bruk GitHub Environments for `staging` og `production` (secrets og approvals).

## Tagging
```
git tag v2.1.0
git push origin v2.1.0
```
