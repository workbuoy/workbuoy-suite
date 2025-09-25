# PR AE: Desktop – E2E-kryptering av offline cache + migrasjon + key mgmt

## Endringsplan
- **Key mgmt**: `desktop/crypto/secure_key.js` – WB_SECRETS_KEY, Keychain (macOS), DPAPI (Windows), file fallback (Linux)
- **Kryptert cache**: `desktop/cache/secure_cache.js` – AES-256-GCM, migrasjon, shredding
- **Migrasjonsskript**: `scripts/migrate_cache_encrypt.js`
- **Integrasjon**: `desktop_demo/offline_sync_demo.js` oppdatert til SecureCache
- **Tester**: `desktop/tests/secure_cache.test.js` (Jest)
- **CI**: `.github/workflows/desktop-encryption-tests.yml`
- **Docs**: `docs/DESKTOP_E2E_ENCRYPTION.md`

## Kommandoer
```bash
# Kjør tester
cd desktop && npm ci && npm test

# Migrer cache lokalt
node scripts/migrate_cache_encrypt.js

# Kjør desktop demo (kryptert cache)
node desktop_demo/offline_sync_demo.js
```

## Rollback
- Reverter til klartekst-cache, eller sett `WB_SECRETS_KEY` for å låse opp uten OS-store.
