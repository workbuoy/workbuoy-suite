
# Security
- SAST: CodeQL; DAST: ZAP; Container: Trivy.
- Keys: ingen hardcodet, bruk ENV/secret-provider.
- Loggmaskering: `lib/security/pii.js` brukt i logger.
- Audit WORM: hash/prev_hash felt i audit_log (append-only modell).


## API Keys & Nøkkelrotasjon
- Hashes lagres, klartekst vises kun ved opprettelse.
- Rotasjon: opprett ny, test, deaktiver gammel.
