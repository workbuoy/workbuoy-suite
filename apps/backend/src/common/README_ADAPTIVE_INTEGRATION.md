# Integrasjon: AdaptiveClient i connectors

Bytt HTTP-kall i connector-workers til å bruke AdaptiveClient.

**Eksempel (Node, SF worker):**
```js
import { AdaptiveClient } from '../../../sdk/js/adaptiveClient.js';
const http = new AdaptiveClient({ maxQPS: process.env.WB_RATE_MAX_QPS || 20 });

const res = await http.request(`${base}/contacts?since=${sinceMs}`, { headers: { Authorization: `Bearer ${token}` } });
const contacts = await res.json();
```

**Miljøvariabler**
- `WB_RATE_MAX_QPS`, `WB_RATE_MIN_QPS`, `WB_RATE_BURST`
```bash
WB_RATE_MAX_QPS=30 WB_RATE_MIN_QPS=2 WB_RATE_BURST=30 node dist/connectors/salesforce/worker-cli.js
```
