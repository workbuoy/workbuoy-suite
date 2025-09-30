# Backend seeding

Standard database bootstrap commands:

```
npm run db:deploy -w @workbuoy/backend
npm run db:seed -w @workbuoy/backend
```

Set `SEED=true` when running against production-like environments to opt in explicitly:

```
SEED=true npm run db:seed -w @workbuoy/backend
```

Regenerate the Prisma client after schema updates with:

```
npm run db:generate -w @workbuoy/backend
```

To verify the script without a database connection (dry run):

```
npm run seed:dry-run -w @workbuoy/backend
```

## Metrics bridge

Enable metrics locally by starting the backend with `METRICS_ENABLED=true`:

```
METRICS_ENABLED=true npm run dev -w @workbuoy/backend
```

Then fetch the Prometheus snapshot:

```
curl http://localhost:3000/metrics
```

### Runtime configuration

- `METRICS_ENABLED` &mdash; set to `true`, `1`, or `yes` to expose `/metrics`. When unset or falsy the route responds with `204 No Content` while keeping the endpoint available.
- `METRICS_PREFIX` &mdash; optional prefix prepended to every exported metric name.
- `METRICS_DEFAULT_LABELS` &mdash; comma-separated `key=value` pairs applied as default labels (for example `service=backend,env=dev`).
- `METRICS_BUCKETS` &mdash; comma-separated list of histogram bucket boundaries shared by backend histograms.

When `METRICS_ENABLED` is true, hitting `/metrics` returns a `200` response with Prometheus text and registers default Node.js/HTTP metrics against a shared registry. The registry, default labels, and prefix are all resolved at request time so you can toggle the feature between test runs.

## CRM smoke-tester

Smoke tests spin up the backend, toggle the CRM feature flag, and verify `POST`/`GET` behaviour for `/api/crm/proposals`.

```bash
CRM_ENABLED=true npm run -w @workbuoy/backend test:smoke:crm
```

To run the metrics validation alongside the CRM flow:

```bash
CRM_ENABLED=true METRICS_ENABLED=true npm run -w @workbuoy/backend test:smoke
```

## Observability endpoints & tester

Følgende feature-flagg styrer hvilke observability-endepunkt som monteres i appen:

- `TELEMETRY_ENABLED` &mdash; eksponerer `POST /observability/telemetry/export` som forventer et `resourceSpans`-array og svarer med `{ accepted }`.
- `LOGGING_ENABLED` &mdash; eksponerer `POST /observability/logs/ingest` som validerer loggnivå og melding og svarer med `{ id, receivedAt }`.

Traceparent-headere i W3C-format (`00-<traceId>-<spanId>-<flags>`) blir plukket opp av `trace`-middlewaret og reflekteres som `trace-id` i responsen når endepunktene er aktivert.

Kjør Jest-suiten lokalt med begge flagg påslått for å verifisere statuskoder, input-validering og header-propagasjon:

```bash
TELEMETRY_ENABLED=true LOGGING_ENABLED=true npm run -w @workbuoy/backend test:observability
```

Sett flaggene til `false` for å bekrefte at endepunktene ikke er montert og dermed gir `404`.
