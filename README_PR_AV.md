# PR AV: Auto-update Rollout & Kill-switch

## Innhold
- **Policy**: `update/policies/rollout.yaml` (+ `rollout.json` brukt av server)
- **Server**: `scripts/update_server_rollout.js` – policy-gating, hold, revoke
- **Repo**: `scripts/create_rollout_repo.sh` – stable/beta feeds med prev-fallback
- **CLI**: `scripts/policyctl.js` – oppdater policy fra CI/CLI
- **Simulator**: `scripts/rollout_client_sim.js` – N klienter, rapporterer rate
- **CI**: `.github/workflows/update-rollout-smoke.yml`
- **Docs**: `docs/AUTO_UPDATE_ROLLOUT.md`

## Kjappstart
```bash
./scripts/create_rollout_repo.sh update_repo http://127.0.0.1:45910
POLICY_PATH=update/policies/rollout.json UPDATE_REPO=update_repo PORT=45910 node scripts/update_server_rollout.js &
node scripts/rollout_client_sim.js --channel stable --n 10 --current 1.0.0
curl -s -X POST -H 'content-type: application/json' -d '{"channel":"stable","hold":true}' http://127.0.0.1:45910/admin/hold
```

## Rollback
- Sett `hold: true` for berørt kanal eller bruk `revoke` på versjon; pek `latest.json` tilbake til `prev.json`.
