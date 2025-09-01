# workbuoy-adaptive

Adaptive HTTP-klient for Python med **token bucket** og **EWMA-backoff**.

```python
from workbuoy_adaptive import AdaptiveClient
client = AdaptiveClient(max_qps=20, min_qps=1, burst=10)
r = client.request('GET', 'https://api.example.com/resource')
print(r.status_code)
```

Lisens: MIT
