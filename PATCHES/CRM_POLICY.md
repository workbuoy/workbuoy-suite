# Patch: Enforce policyGuard on CRM routes

Edit the CRM contacts route file (e.g. `src/features/crm/contacts.route.ts`) and ensure **policyGuard** is applied on write operations:

```ts
import { policyGuard } from "../../core/policy";

// Create
router.post("/api/crm/contacts", policyGuard, (req, res) => {
  // ... existing handler
});

// Delete
router.delete("/api/crm/contacts/:id", policyGuard, (req, res) => {
  // ... existing handler
});
```

Then run tests:
```
npm test -- --runTestsByPath tests/crm.policy.test.ts
```
