# Release Seal (PR AX)

Denne PR-en genererer en signérbar manifest for innholdet i repoet som er releaserelevant (dashboards, regler, workflows, mapper mv.), og gate'r releasen på at kritiske workflows er grønne.

## Artefakter
- `reports/seal.json` – fil-liste med `{ path, size, mtime, sha256 }`
- `reports/seal.SHA256SUMS` – enkel liste `sha256  path`
- `reports/seal.SHA256SUMS.asc` – (valgfritt) GPG-signatur hvis `GPG_PRIVATE_KEY` er satt

## CI
Workflow: `.github/workflows/release-seal.yml`
1. Bygger `seal.json` (Python)
2. **Gate**: sjekker siste run av kritiske workflows via GitHub API (må ha `GITHUB_TOKEN`)
3. Signerer med GPG (valgfritt)
4. Laster opp artefakter

## Verifisering
```bash
# lokalt
python3 scripts/release_seal_build.py
python3 scripts/release_manifest_verify.py reports/seal.json

# GPG
gpg --verify reports/seal.SHA256SUMS.asc reports/seal.SHA256SUMS
sha256sum -c reports/seal.SHA256SUMS
```

## Konfigurering
`release_config.json` – liste over workflows som må være grønne:
- desktop-encryption-tests, update-feed-smoke, desktop-e2e-load,
- salesforce-connector-tests, dynamics-connector-tests,
- alert-hygiene-lint, update-rollout-smoke, desktop-telemetry-smoke.

Oppdater listen ved behov.

## Notater
- Hvis `GITHUB_TOKEN`/`GPG_PRIVATE_KEY` mangler, vil workflowen hoppe over henholdsvis gate/signering eller feile gate avhengig av miljø. I GitHub Actions er et token normalt tilgjengelig.
