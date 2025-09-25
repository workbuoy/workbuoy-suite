# PR AR: GA Release Orchestration

## Innhold
- `VERSION` – kildesannhet for versjon (settes også fra workflow input).
- `CHANGELOG.md` – konsolidert 1.0 endringer.
- `ops/bom/software-bom.yaml` – enkel BOM (mock).
- `scripts/release_manifest.js` – genererer `release/manifest.json` med SHA256.
- `.github/workflows/release.yml` – workflow_dispatch for GA-release:
  - bygger backend-image (placeholder),
  - bygger desktop bundles (matrix, placeholder),
  - samler artefakter, genererer manifest,
  - lager GitHub Release med artefakter + BOM + manifest.
- `docs/RELEASE_NOTES_1.0.md` – høydepunkter, kjente avvik, oppgradering.

## Bruk
1. Trigger workflow **ga-release** manuelt med input `version` (f.eks. `1.0.0`).
2. Workflow genererer og publiserer Release med artefakter og metadata.

## Rollback
- Opprett patch-versjon (1.0.1) med fix; depreker/arkiver 1.0.0 om nødvendig.
