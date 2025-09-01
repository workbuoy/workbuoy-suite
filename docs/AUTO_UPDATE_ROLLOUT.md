# Auto-update rollout & kill-switch (PR AV)

Denne PR-en legger på **policy-styrt utrulling**, **hold/revoke** og enkel simulering.

## Policy
`update/policies/rollout.yaml` (kilde for mennesker) og `update/policies/rollout.json` (leses av server)
```yaml
channels:
  stable:
    percent: 30
    allow_os: { windows: true, mac: true, linux: true }
    min_version: "1.0.0"
    max_version: null
    hold: false
    revoked: []
  beta:
    percent: 100
    ...
```

## Server
`scripts/update_server_rollout.js`
- **Feed**: `GET /feed/<channel>/latest.json` (headers: `x-client-id`, `x-os`, `x-current-version`)
- **Admin**:
  - `POST /admin/set` `{ channel, percent, allow_os?, min_version?, max_version? }`
  - `POST /admin/hold` `{ channel, hold: true|false }`
  - `POST /admin/revoke` `{ channel, version }`
- **Revoked**: hvis `latest.version` er i `revoked`, serverer `prev.json` (fallback).

## Repo
`scripts/create_rollout_repo.sh` lager
```
update_repo/
  stable/latest.json  (1.0.1)
  stable/prev.json    (1.0.0)
  beta/latest.json    (1.1.0-beta.1)
  artifacts/*
```

## CLI
`scripts/policyctl.js`
```bash
node scripts/policyctl.js show
node scripts/policyctl.js set --channel stable --percent 25 --allow-os windows,mac
node scripts/policyctl.js hold --channel stable --on true
node scripts/policyctl.js revoke --channel stable --version 1.0.1
```

## CI smoke
`.github/workflows/update-rollout-smoke.yml`:
- Starter server, **30%** stable → simulerer 10 klienter.
- **Hold** stable → 0% updates.
- **Revoke** 1.0.1 → feed server **1.0.0** fra `prev.json`.
- **Beta** kanal → ~100% får oppdatering.

## Integrasjon med PR AF/AG
- Kombiner signerte artefakter (PR AF) med kanaler (PR AG) og denne policy-gatingen for trygg phased rollout og nød-stop (kill-switch).
