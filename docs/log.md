# Log API (MVP)

## List
`GET /api/log?level=info|warn|error`

## Append
`POST /api/log` body:
```json
{ "level": "info", "msg": "hello", "meta": { "foo": "bar" } }
```

Each append creates an audit entry with `hash` and `prevHash` (hashchain).
