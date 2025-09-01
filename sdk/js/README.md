# @workbuoy/adaptive-client

Adaptive HTTP-klient for Node med **token bucket** og **EWMA-backoff**.  
Håndterer `429` (Retry-After) og `5xx` og eksponerer Prometheus-metrikker.

## Bruk
```js
import { AdaptiveClient } from '@workbuoy/adaptive-client';
const http = new AdaptiveClient({ maxQPS: 20, minQPS: 1, burst: 10 });
const res = await http.request('https://api.example.com/resource');
```

## Miljø
- `WB_RATE_MAX_QPS`, `WB_RATE_MIN_QPS`, `WB_RATE_BURST`

## Lisens
MIT
