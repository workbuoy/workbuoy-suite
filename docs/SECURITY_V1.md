# Security v1

- **RBAC**: `src/core/security/rbac.ts` → `rbac(["admin","operator"])`
- **PII**: `src/core/security/pii.ts` → `maskPII(obj)` i logger og eksport.
- **EU residency**: `src/core/config/flags.ts` → `EU_RESIDENCY` flag.

### Eksempel
```ts
import { rbac } from "../../core/security/rbac";
router.delete("/api/crm/contacts/:id", rbac(["admin"]), handler);
```
