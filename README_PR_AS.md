# PR AS: Supply-chain & Provenans

## Innhold
- **Policy**: `ops/supplychain/cluster-image-policy.yaml` – håndheving av OIDC-signerte bilder i `prod`/`staging`.
- **Verifisering**: `ops/supplychain/cosign-verify.sh`, `cosign-verify-attest.sh`.
- **SBOM**: `ops/bom/generate_sbom.sh` og workflow `.github/workflows/sbom.yml` (Syft/CycloneDX).
- **Desktop checksums**: `scripts/checksums.sh` + workflow `.github/workflows/desktop-sign.yml` (minisign valgfritt).
- **Containers**: `.github/workflows/containers-sign.yml` – bygg, push, **cosign sign (keyless)**, attester **provenance**.
- **Docs**: `docs/SUPPLY_CHAIN.md`.

## Forutsetninger
- GitHub Packages (GHCR) aktivert.
- Set optional secret `MINISIGN_SECRET_KEY` for signering av checksums.

## Rollback
- Disable workflows eller fjern policy i cluster; eksisterende signaturer/attester blir liggende for revisjon.
