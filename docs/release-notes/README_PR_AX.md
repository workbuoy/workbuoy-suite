# PR AX: Final Release Review & Seal

## Innhold
- **Release notes**: `docs/RELEASE_NOTES_v1_enterprise.md`
- **Seal**: `scripts/release_seal_build.py`, `scripts/release_manifest_verify.py`
- **Gate**: `scripts/check_workflows.sh` + `release_config.json`
- **CI**: `.github/workflows/release-seal.yml`
- **Docs**: `docs/RELEASE_SEAL.md`

## Hurtigstart
```bash
python3 scripts/release_seal_build.py
python3 scripts/release_manifest_verify.py reports/seal.json
```

## Rollback
- Deaktiver `release-seal.yml` eller fjern gating midlertidig i `release_config.json`.
