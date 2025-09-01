# SDK Publishing (PR AP)

Denne PR-en etablerer publisering av SDK-ene til **NPM** og **PyPI** via GitHub Actions.

## Versjonering fra tags
- JS: tag med format `sdk-js-vMAJOR.MINOR.PATCH` (f.eks. `sdk-js-v1.0.0`).
- Python: tag med format `sdk-py-vMAJOR.MINOR.PATCH`.

## Secrets
- **NPM**: `NPM_TOKEN` (automation-token, 2FA bypass for CI).
- **PyPI**: `PYPI_API_TOKEN` (Project API token, `pypi-...`).

## Provenance & Signering
- **npm provenance**: `npm publish --provenance` (OIDC fra GitHub Actions).
- **PyPI**: valgfritt `sigstore`-trinn (se kommentert del i workflow) eller last opp SHA256-sjekksummer.

## SemVer-policy
- `MAJOR`: inkompatible endringer
- `MINOR`: nye kompatible features
- `PATCH`: feilrettinger

## Publisering (lokalt – kun for verifikasjon)
```bash
# JS
cd sdk/js
npm version 1.0.0
npm publish --access public

# Python
cd sdk/python
python -m build
twine upload dist/*
```
