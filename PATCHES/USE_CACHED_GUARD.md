# Use cached policy guard

1) Import cached guard in your routers instead of the basic guard:

```ts
import { policyV2GuardCached as policyV2Guard } from "../../core/policyV2/middleware.cached";

router.post("/api/tasks", policyV2Guard("write","low"), handler);
router.get("/api/tasks",  policyV2Guard("read","low"),  handler);
```

2) (Optional) Tune TTL/version via env:
```
POLICY_CACHE_TTL=60
```

3) Verify with tests:
```
npm test -- --runTestsByPath tests/policy.guard.cached.test.ts
```
