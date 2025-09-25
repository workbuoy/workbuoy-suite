# PR AA: Desktop E2E + load-test (+ release hygiene)

## Endringsplan
- **E2E**: `desktop/tests/e2e_offline_sync.ts` – offline → sync verifisert mot mock-API
- **Load**: `desktop/tests/sync_load.ts` – 1000–5000 pending ops, rapport til `reports/sync_load.json`
- **Redis soak**: `desktop/tools/load/redis_soak.ts` – stress Redis-kø og rapport
- **CI**: `.github/workflows/desktop-e2e-load.yml` – kjører alle tester på Ubuntu med Redis-service
- **Docs**: `docs/DESKTOP_TESTS.md`
- **Nice-to-have**:
  - **Release-please**: `.github/workflows/release-please.yml` + `CHANGELOG.md`
  - **SDK publish**: `.github/workflows/sdk-publish.yml` + `sdk/ts/` scaffold (NPM/PyPI secrets kreves)

## Kommandoer (lokalt)
```bash
cd desktop
npm ci
npm run build
npm run test # kjører e2e + load + redis-soak (krever Redis lokalt for redis-soak)
```

## Manuell validering
- Sjekk `reports/*.json` etter kjøring. Bekreft at `pending`=0, `throughput`>0, og Redis `backlog`=0.

## Rollback
- Deaktiver CI-jobben ved å sette `if: false` eller fjerne workflow-filen.
