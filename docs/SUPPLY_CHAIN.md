# Supply-chain Security & Provenans (PR AS)

Denne PR-en introduserer signering, provenans og SBOM for WorkBuoy-artifakter.

## Container-bilder
- **Signering**: Cosign keyless (GitHub OIDC).  
- **Provenans**: GitHub `actions/attest-build-provenance` (in-toto SLSA-lignende attestasjon).

### Verifisering (lokalt)
```bash
cosign verify   --certificate-identity-regexp "https://github.com/.+/.+/.github/workflows/.+@.+"   --certificate-oidc-issuer "https://token.actions.githubusercontent.com"   ghcr.io/<org>/workbuoy-backend:<tag>
```
Attestasjon (provenans):
```bash
cosign verify-attestation   --type slsa-provenance   ghcr.io/<org>/workbuoy-backend:<tag>
```

### Policy (Kubernetes)
Se `ops/supplychain/cluster-image-policy.yaml` for policy-controller (sigstore) som krever OIDC-signerte bilder for `prod`/`staging` namespaces.

## Desktop-artefakter
- **SHA256SUMS.txt** genereres i CI og lastes opp i Release.
- (Valgfritt) **Minisign**-signering: Sett secret `MINISIGN_SECRET_KEY` i repo; CI genererer `.minisig` for SHA256SUMS.txt.

Verifisering:
```bash
sha256sum -c SHA256SUMS.txt
# minisign -Vm SHA256SUMS.txt -P <public-key>
```

## SBOM
- Genereres med **Syft** → `sbom.cdx.json` (CycloneDX) + `sbom.spdx.json`.
- Ligger som Release assets; bruk til compliance/skanning.

Validering:
```bash
jq '.components | length' sbom/sbom.cdx.json
```

## Nøkler & rotasjon
- Cosign keyless krever ingen nøkkelrotasjon (OIDC + tlog/rekor).  
- Minisign: roter `MINISIGN_SECRET_KEY`, distribuer ny public key.

## Trusselmodell
- Hindrer usignerte/ukjente bilder i prod.
- Gir sporbarhet (provenans) og software inventory (SBOM).
