# RBAC Policy (PR A)

**Roller**
- admin: full tilgang i tenant
- manager: full tilgang i tenant
- contributor: lese alle, skrive egne records
- viewer: kun lesing

**Scope**
- tenant → pipeline → record

**Evaluering**
App-lag evaluerer via `src/rbac/policy.ts`. Integrer i API-ruter i PR B.