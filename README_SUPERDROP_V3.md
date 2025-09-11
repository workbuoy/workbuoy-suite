# Superdrop v3 — Policy v2 + Security v1 + Release pipeline

Denne droppen gir:
- **Policy v2**: konfig-drevne regler (autonomy/role/category/risk) + Express guard.
- **Security v1**: RBAC + PII-mask + EU-residency flag.
- **Release**: Dockerfile, .dockerignore, GitHub Actions (tag → GHCR), Helm chart skeleton.

## Branch & PR
```
git checkout -b feat/superdrop-v3-policy-security-release
# pakk ut i repo-roten
git add .
git commit -m "feat(superdrop-v3): policy v2 (config), security v1 (rbac/pii), release pipeline (docker+helm+actions) + tests + docs"
git push -u origin feat/superdrop-v3-policy-security-release
```

## Bruk
- Wire `policyV2Guard` på relevante ruter (write/read).
- Bruk `rbac([...])` på sensitive ruter.
- Masker PII i logger/exports med `maskPII`.

## Test
```
npm test -- --runTestsByPath tests/policyV2.decide.test.ts tests/security.pii.test.ts tests/security.rbac.test.ts
```

## Release
- Opprett tag `vX.Y.Z` for å trigge release workflow.
- Tilpass `deploy/helm` verdier for ditt miljø.
