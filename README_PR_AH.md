# PR AH: Desktop E2E – Konfliktløsing + Last-test + Telemetry (mock)

## Endringsplan
- **Sync lib**: `scripts/sync_lib.js` – SecureCache-basert sync med LWW/merge, concurrency og retries.
- **Mock-API**: `scripts/mock_crm_api_conflict.js` – konflikter (409), 1% feilrate, introspeksjon.
- **E2E**: `scripts/desktop_e2e_conflict_test.js` – verifiserer konfliktløsing og endelig remote state.
- **Load**: `scripts/desktop_load_test.js` – 1200+ ops, måler throughput og feilrate, rapporterer til `reports/desktop_sync_load.json`.
- **CI**: `.github/workflows/desktop-e2e-load.yml` – kjører begge, laster opp rapporter.
- **Docs**: `docs/DESKTOP_TESTS_E2E.md` – kjøring, tolkning, parametre.

## Test-kommandoer
```bash
node scripts/desktop_e2e_conflict_test.js
LOAD_OPS=2000 node scripts/desktop_load_test.js
```

## Manuell validering
- Sjekk at `reports/*.json` finnes og at `error_rate < 0.02`.
- Endre `FAIL_RATE` for å se backoff/retry-effekt.

## Rollback
- Fjern workflow/skript; behold SecureCache fra PR AE uendret.
