Repository Structure
====================

```
.
├─ apps/
│  ├─ backend/      # API & services
│  └─ frontend/     # Web app
├─ types/           # shared ambient types
├─ tools/           # guards, scripts
├─ deploy/
│  ├─ helm/         # charts
│  └─ k8s/          # rendered/static manifests
├─ docs/            # guides, ADRs, policies, release notes
├─ .github/         # workflows, CODEOWNERS, dependabot
└─ package.json     # workspace root
```

Active development: apps/backend, apps/frontend

Shared configs: tsconfig.base.json, .eslintrc.cjs, .spectral.yaml

CI workflows live in .github/workflows/
