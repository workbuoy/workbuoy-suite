# Backend testing guide

## Running tests locally

From the repository root you can run the backend test suite in watch or CI-like modes:

```bash
npm run test -w @workbuoy/backend
```

For single files you can pass Jest's `--runTestsByPath` flag, e.g.:

```bash
npm run test -w @workbuoy/backend -- --runTestsByPath src/metrics/registry.runtime.spec.ts
```

## Metrics runtime configuration

Some metrics tests rely on runtime environment flags. Set these when you need to exercise the happy path:

- `METRICS_ENABLED=true` to enable metric exposure.
- `METRICS_PREFIX=wb_` (optional) to namespace emitted metric names.
- `METRICS_DEFAULT_LABELS=service=backend` (optional) to set default labels.

Unset or set `METRICS_ENABLED=false` to simulate the disabled path (this is the default in CI).

## CI-aligned commands

Locally you can mirror the CI pipeline with:

```bash
npm run typecheck -w @workbuoy/backend
npm run lint
npm run test -w @workbuoy/backend -- --ci --runInBand --reporters=default --reporters=jest-junit --coverage
```
