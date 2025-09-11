# Policy v2 (config-driven)

- Regler i `config/policy.rules.json`
- Evalueres via `src/core/policyV2/evaluate.ts`
- Express-guard: `policyV2Guard(category, risk)` fra `src/core/policyV2/middleware.ts`

### Eksempel på bruk i rute
```ts
import { policyV2Guard } from "../../core/policyV2/middleware";
router.post("/api/tasks", policyV2Guard("write", "low"), handler);
router.get("/api/tasks", policyV2Guard("read", "low"), handler);
```

### Hot reload (dev)
Slett cache før reload:
```ts
import { clearCache } from "../../core/policyV2/loader";
clearCache(); // reload fra fil
```
