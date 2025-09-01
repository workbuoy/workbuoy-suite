# Desktop E2E-kryptering av offline cache (PR AE)

Denne PR-en innfører **ende-til-ende-kryptering** (AES-256-GCM) av desktop-kø/cache, med nøkkelhåndtering og migrasjon fra eksisterende klartekst-cache.

## Arkitektur
- **Nøkkel-kilde** (prioritet):
  1. `WB_SECRETS_KEY` (env) → derives med scrypt til 32 bytes
  2. macOS **Keychain** (service: `WorkBuoyDesktopKey`)
  3. Windows **DPAPI** (CurrentUser) – lagrer beskyttet nøkkel i `%APPDATA%/WorkBuoy/desktop.key.protected`
  4. Linux/fallback: `~/.config/workbuoy/desktop.key` (chmod 600)

- **Format**: `base64(WB1_ | IV(12) | CIPHERTEXT | TAG(16))`

- **Migrasjon**: Hvis `.wb_cache.json` finnes og `.wb_cache.enc` ikke finnes → krypter, shred original og slett.

## Bruk
```bash
# Migrer eksisterende cache
node scripts/migrate_cache_encrypt.js
# Desktop demo bruker nå kryptert cache
node desktop_demo/offline_sync_demo.js
```

## Key rotation
1. Sett ny `WB_SECRETS_KEY` (eller oppdater OS-store).  
2. Lås opp med gammel nøkkel → re-enkryptér cache med ny nøkkel (kommando kan legges til i videre arbeid).

## SQLCipher
Denne PR-en bruker Node `crypto` (AES-GCM) for filkryptering. For SQLite/SQLCipher-integrasjon, bytt cache-driver og bruk **sqlcipher**-bygget `better-sqlite3` eller tilsvarende – nøkkel hentes fra `secure_key`. (Utenfor scope i denne PR, men dokumentert for videreføring.)

## Sikkerhetstips
- Sett `WB_SECRETS_KEY` i MDM/Intune/Jamf secrets for maskiner uten OS-key store-tilgang.  
- Sørg for disk-kryptering (FileVault/BitLocker/LUKS) som tilleggslinje av forsvar.
