# Desktop E2E – Konflikter & Last (PR AH)

Denne PR-en utvider testene for Desktop-klienten med:
- **Konfliktløsing** (Last-Write-Wins og valgfri merge-policy)
- **Lasttest** (1000+ operasjoner) med throughput/feilrate-rapport
- **Telemetry (mock)** – rapporter i `reports/` kan kobles inn i Grafana/OTEL-pipelines senere

## Kjør lokalt
```bash
# Konflikt-test (LWW)
node scripts/desktop_e2e_conflict_test.js
cat reports/desktop_conflict.json

# Last-test (default 1200 ops, 1% kunstig feilrate)
LOAD_OPS=1500 node scripts/desktop_load_test.js
cat reports/desktop_sync_load.json
```

## Tolkning
- `reports/desktop_conflict.json` – viser policy, tid, og slutt-tilstand for `conflict-1` på serveren.
- `reports/desktop_sync_load.json` – felter:
  - `ops`, `duration_s`, `throughput_ops_s`
  - `success`, `failed`, `retries`, `passes`, `error_rate`

**Aksept:** `failed/ops < 0.02` og kø tømmes innen rimelig antall pass.

## Parametre
- `MERGE_POLICY=merge` for å skru på feltsammenslåing i konflikt-test.
- `FAIL_RATE=0.02` for å endre serverens simulerte feilrate.
- `LOAD_OPS=5000` for større last.

## Videre arbeid
- Integrer Redis-backed jobbkø og eksponer ekte OTEL-metrikker for sync throughput.
