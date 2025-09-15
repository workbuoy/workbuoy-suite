# PR5 — OpenAPI specs + Spectral lint (non-blocking) + docs

## Hva som inngår
- `openapi/crm.yaml`, `openapi/tasks.yaml`, `openapi/log.yaml`, `openapi/buoy.yaml`
- `.github/workflows/openapi-lint.yml` — kjører Spectral på PR/push (non-blocking)
- `docs/api.md` — lenker og retningslinjer

## Kjør lokalt
```bash
npm i -g @stoplight/spectral-cli@6
spectral lint "openapi/**/*.yaml"
```

## Commit-melding
```
chore(openapi): add specs for CRM/Tasks/Log/Buoy + CI lint (non-blocking) + docs
```
