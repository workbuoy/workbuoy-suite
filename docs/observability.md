# Observability quick reference

Backend-observabilityen eksponerer Prometheus-metrics og strukturerte logger som kan verifiseres lokalt eller i CI.

## Prometheus `/metrics`

Aktiver ruten med `METRICS_ENABLED=true` når du starter backend. Slik ser en typisk respons ut (forkortet for klarhet):

```
# HELP workbuoy_request_duration_seconds Request latency in seconds.
# TYPE workbuoy_request_duration_seconds histogram
workbuoy_request_duration_seconds_count{service="backend",version="1.1.0",le="+Inf"} 12
# HELP workbuoy_active_sessions Current authenticated sessions.
# TYPE workbuoy_active_sessions gauge
workbuoy_active_sessions{service="backend",version="1.1.0"} 4
```

- Alle tidsserier inkluderer `service="backend"` og `version="<package.json version>"` automatiske labels.
- HTTP-svaret er alltid `200 OK` med `content-type: text/plain; version=0.0.4; charset=utf-8`.

### Hurtigsjekk med `curl`

```bash
curl -sD - http://localhost:3000/metrics \
  | tee /tmp/metrics.txt \
  | grep -i 'content-type: text/plain; version=0.0.4; charset=utf-8'
```

- Header-sjekken bekrefter at prom-scrapere tolker svaret korrekt.
- `grep 'service="backend"' /tmp/metrics.txt` bekrefter at standardlabelen er til stede.

## GitHub Actions-sammendrag

Når `npm run test:contract -w @workbuoy/backend` feiler på `/metrics`, legger pipeline et sammendrag i `$GITHUB_STEP_SUMMARY` med forventede headere og manglende labels for rask diagnose.
