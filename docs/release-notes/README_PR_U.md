# PR U: Desktop E2E crypto + conflict handling

## Endringsplan
- **E2E-krypto**: Kryptert payload i SQLite (`payload_b64`) med AES-256-GCM; PBKDF2 for nøkkel; rotasjon via `SecureDb.rotatePassphrase()`
- **Konflikter**: LWW i `SyncEngine` med `onMerge`-hook; logger event for konflikter
- **CLI**: `tools/wb-keytool.ts` – `check` og `rotate`
- **Tester**: `tests/crypto_roundtrip.ts`, `tests/conflict_handling.ts`
- **CI**: `.github/workflows/desktop-security-tests.yml`
- **Docs**: `docs/DESKTOP_SECURITY.md`

## Kommandoer
```bash
cd desktop
npm ci
npm run build
npm test
# CLI
node dist/tools/wb-keytool.js --help
```

## Manuell validering
- Kjør `crypto_roundtrip` og verifiser `CRYPTO PASS`.
- Simuler konflikt og se `CONFLICT PASS`, samt at lokal/remote velges iht. LWW/merge.

## Rollback
- Deaktiver merge-hook; behold tidligere passfrase/salt (ingen API-endring nødvendig).
