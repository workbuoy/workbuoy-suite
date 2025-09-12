# Cleanup Patch — Policy v2 by default, Priority EventBus + DLQ debug, Logger PII shim

**What’s inside**
- `src/core/policy/guard.ts` — map legacy `policyGuard` to Policy V2.
- `src/core/events/priorityBus.ts` — priority bus with retry + DLQ.
- `src/core/http/routes/debug.dlq.ts` — GET /api/_debug/dlq (dev).
- `src/core/security/maskValue.ts` — shim mapping maskValue→maskPII.
- `tests/events.priorityBus.test.ts` — verifies priority+DLQ.

**Apply**
```bash
git checkout -b feat/cleanup-policy-bus-mask
unzip workbuoy-cleanup-patch.zip -d .
git add .
git commit -m "chore(cleanup): policy v2 shim, priority event bus, DLQ debug, maskValue→maskPII"
git push -u origin feat/cleanup-policy-bus-mask
```
