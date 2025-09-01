# Desktop-kryptering (PR AE)
Denne modulen aktiverer E2E-kryptering av offline-cache når klienten kjøres med SQLCipher-bygget `better-sqlite3`.
- Nøkkel hentes fra OS-keyring via `keytar` (fallback: `WB_SECRETS_KEY`).
- Migrasjonsskript: `npm run migrate:encrypt`.
Merk: For faktisk kryptering må Electron-bundle linkes mot SQLCipher-biblioteket.
