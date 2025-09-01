# PR AG: Auto-update Feed – stable/beta + smoke

## Innhold
- Server: `scripts/update_server.js`
- Repo-generator: `scripts/create_mock_updates.sh`
- Client config: `desktop/update/config.json`
- Client check: `scripts/update_check.js`
- CI: `.github/workflows/update-feed-smoke.yml`
- Docs: `docs/DESKTOP_AUTO_UPDATE.md`

## Quick start
```bash
./scripts/create_mock_updates.sh
UPDATE_REPO=update_repo PORT=45900 node scripts/update_server.js &
node scripts/update_check.js --channel stable --expect-version 1.0.0
node scripts/update_check.js --channel beta --expect-version 1.0.1-beta.1
```

## Rollback
- Slå av workflow og pek `feedURL` tilbake til forrige miljø.
