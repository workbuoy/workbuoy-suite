# Privacy Webhooks (PR AN)

**Event-type:** `privacy.event`  
**Payload (eksempler):**
```json
{ "event":"privacy.export.started", "userId":"u1", "jobId":"...", "ts":1710000000000 }
{ "event":"privacy.export.completed", "userId":"u1", "jobId":"...", "url":"https://signed.example/export.json", "ts":1710000005000 }
{ "event":"privacy.delete.started", "userId":"u2", "jobId":"...", "scope":"all", "ts":1710000002000 }
{ "event":"privacy.portability.generated", "userId":"u3", "size": 12345, "ts":1710000003000 }
```

**Retries:** exponential backoff inntil 24t, signering via HMAC `X-WB-Signature` (ikke implementert i mock).

**Sikkerhet:**  
- Lever kun minimalt med PII i webhook-payloads.  
- Tilby mottakere mulighet for å hente detaljer via pull-API med kortlevd token.
