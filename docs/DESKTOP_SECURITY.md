# Desktop – E2E-kryptering & konflikt-håndtering

## Nøkkelflyt (E2E)
- Brukerpassfrase → PBKDF2 (200k runder, SHA-256) → 32B nøkkel
- Salt lagres i `<workdir>/.wb_salt`
- Alle payloads i SQLite lagres som **AES-256-GCM**-kryptert base64 (`payload_b64`)
- Rotasjon: `wb-keytool rotate --dir <dir> --old <old> --new <new>` – re-krypterer alle payloads med ny salt/nøkkel

## Konflikter
- Default: **Last-Write-Wins (LWW)** basert på `updated_at` (millisekunder epoch)
- Opt-in merge: `onMerge(entity, local, remote)` i `SyncEngine`-konfig returnerer et sammenslått objekt; ellers LWW
- Konflikter logges som event (`desktop.conflict.lww`) via telemetry (no-op i dev)

## CLI
```bash
cd desktop
npm run build
node dist/tools/wb-keytool.js --help
node dist/tools/wb-keytool.js check --dir .wb_secure --pass "secret"
node dist/tools/wb-keytool.js rotate --dir .wb_secure --old "old" --new "new"
```

## Trusselmodell (kort)
- Disk-tyveri: payloads er kryptert; uten passfrase kan data ikke leses
- Minneangrep: utenfor scope; nøkkel ligger i minne mens appen kjører
- Phishing/brukerfeil: ikke mitigert av kryptering; anbefal SSO/2FA for nettkonto

## Recovery
- Uten passfrase kan ikke payloads dekrypteres (designvalg for E2E)
- Sikkerhetskopier saltfil og DB mappe; ikke del nøkkel/passfrase i klartekst
