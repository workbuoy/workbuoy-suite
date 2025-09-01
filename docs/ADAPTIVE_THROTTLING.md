# Adaptive Throttling (PR AO)

Denne PR-en leverer adaptiv rate-limiting for SDK og connectors, basert på:
- **Token Bucket** (QPS/burst)
- **EWMA-inspirert backoff** ved `429`/`5xx` og `Retry-After`
- Telemetri: `wb_rate_qps` (Gauge), `wb_backoff_events_total` (Counter), `wb_throttle_queue_depth` (Gauge)

## Parametre
- `WB_RATE_MAX_QPS` (default 20)
- `WB_RATE_MIN_QPS` (default 1)
- `WB_RATE_BURST` (default = max(5, max_qps))

## JS-bruk
```js
import { AdaptiveClient } from '@workbuoy/adaptive-client';
const http = new AdaptiveClient({ maxQPS: 20, minQPS: 1, burst: 10 });
const res = await http.request('https://api.example.com/resource');
```

## Python-bruk
```python
from workbuoy_adaptive import AdaptiveClient
client = AdaptiveClient(max_qps=20, min_qps=1, burst=10)
r = client.request('GET', 'https://api.example.com/resource')
```

## Tuning
- Start konservativt for eksterne leverandører (f.eks. `maxQPS=10, burst=10`).
- Øk `halfLifeMs` for tregere respons på kortsiktige spikes.

## Tester
- JS: `sdk/js/adaptiveClient.test.js` – mock server med variabel kapasitet; verifiser QPS ned/opp + lav 429-rate.
- Python: `sdk/python/tests/test_adaptive.py` – tilsvarende.

## Telemetri
Eksponer `prom-client` (Node) / `prometheus_client` (Python) på deres eksisterende metrics-endepunkt for å samle inn målinger.
