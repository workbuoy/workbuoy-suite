# PR AP: SDK publisering – NPM & PyPI + release-notes

## Endringsplan
- **JS (NPM)**: `sdk/js` med `publishConfig`, README, CHANGELOG og workflow `sdk-js-publish.yml` (tag: `sdk-js-v*`).
- **Python (PyPI)**: `sdk/python` med `pyproject.toml`, README, CHANGELOG og workflow `sdk-py-publish.yml` (tag: `sdk-py-v*`).
- **Release-notes**: `RELEASE_NOTES_SDK.md`
- **Docs**: `docs/SDK_PUBLISHING.md`

## Publiseringsflyt
1. Oppdater kode.
2. Opprett tag: `sdk-js-v1.0.0` eller `sdk-py-v1.0.0`.
3. Push tag → GitHub Actions bygger og publiserer pakker.

## Rollback
- Depreker versjon i registry.
- Publiser patch-versjon med fix.
