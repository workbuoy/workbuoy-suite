# DB persistence for roles & usage + caps integration (proactivity-aware, gap fill)

## Hva er gjort
- Rollenivå, funksjoner, overrides, brukerbindings og usage-signaler er persistente i Postgres (med seed fra roles.json).
- Nye admin-endepunkt for roller/import, overrides og subscription.
- Aktiv funksjonsranking (features/active) koblet mot DB-usage.
- Proactivity-context bygger på rolle/feature-cap + subscription-plan + tenant flags.

## Allerede på plass
- EventBus, policyV2, audit-hash chain, safeMount, explainability surfaces.

## Nye filer / endringer
- `src/roles/db/*.v2.ts`, `src/telemetry/usageSignals.db.v2.ts`
- `backend/routes/admin.roles.ts`, `backend/routes/admin.subscription.ts`
- `scripts/seed-roles-from-json-v2.ts`
- `prisma/patches/20250920_roles_usage_persistence.sql`
- Docs: api.md, roles.md, usage.md, proactivity.md (append)
- OpenAPI: nye endpoints lagt til
- CI: Postgres service + migrate deploy

## Akseptanse
- FF_PERSISTENCE=false → alt grønt som før.
- FF_PERSISTENCE=true → Postgres, migreringer kjørt, smoke tester grønne.

## TODO
- Admin-UI for rolle/override management
- Metrics for usage-telemetry
