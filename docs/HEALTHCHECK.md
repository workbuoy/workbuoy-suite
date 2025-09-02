# WorkBuoy API Healthcheck

This repository exposes a lightweight liveness endpoint in the secure app:

- **Path:** `/api/healthz`
- **Method:** `GET`
- **Response:** `{ "ok": true, "ts": "<ISO timestamp>" }`
- **Status:** `200 OK`

It is intended for smoketests, uptime probes and CI checks.

## Local check

```bash
# From repo root
cd backend
npm ci
npm run build
npm start &
PID=$!
sleep 2
curl -s http://localhost:3000/api/healthz | jq .
kill $PID
```

> Tip: In production behind a reverse proxy, make sure `/api/healthz` is not rate-limited.
