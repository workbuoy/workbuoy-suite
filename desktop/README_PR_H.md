# PR H: Desktop offline sync + E2E-kryptering

## Endringsplan
- `desktop/src/crypto.ts` – PBKDF2 + AES-256-GCM
- `desktop/src/storage/secureDb.ts` – SQLCipher-kompatibel wrapper, tabeller
- `desktop/src/sync/syncEngine.ts` – pending queue, push/pull, status
- `desktop/src/sync/conflict.ts` – LWW + field-merge
- `desktop/src/sync/demo.ts` – demo-script
- `docs/DESKTOP_SYNC.md` – dokumentasjon

## Test (lokalt)
```bash
cd desktop
npm ci
npm run build
WB_PASSPHRASE=dev-secret API_BASE_URL=http://localhost:3000 API_KEY=dev-123 TENANT_ID=demo-tenant node dist/src/sync/demo.js
```

## Rollback
Sett `SYNC_ENABLED=false` i miljøet for å deaktivere sync midlertidig.
