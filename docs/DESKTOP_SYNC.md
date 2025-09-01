# Desktop – Offline Sync & E2E-kryptering

## Oversikt
- Lokal cache: **SQLite** database (`workbuoy.enc.sqlite`) med `cached_entities` og `pending_ops`.
- Kryptering: **AES-256-GCM** via nøkkel avledet fra passfrase (PBKDF2 120k runder).
- Sync-motor: flush av `pending_ops` → fetch siste data → oppdater cache.
- Konfliktløsning: **LWW** (last-write-wins) som default; valgfri **field-merge** for `custom_fields`.

## Miljøvariabler
- `SYNC_ENABLED=true|false` (default true)
- `API_BASE_URL`, `API_KEY`, `TENANT_ID`
- `WB_PASSPHRASE` – passfrase for nøkkelavledning

## Bruke lokalt (demo)
```bash
cd desktop
npm ci
npm run build
WB_PASSPHRASE=dev-secret API_BASE_URL=http://localhost:3000 API_KEY=dev-123 TENANT_ID=demo-tenant node dist/src/sync/demo.js
```

## Nøkkelhåndtering
- Salt lagres som `.wb/.wb_salt`.
- Ved passordbytte må data re-krypteres (ikke implementert i PR H).

## Gjenoppretting
- Uten passfrase kan ikke cache leses (designet for konfidensialitet). Sørg for key escrow i enterprise (følger i egen PR).
