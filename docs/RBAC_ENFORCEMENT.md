# RBAC-enforcement for CRM (PR T)

## Modell
- **Roller**: `admin`, `manager`, `contributor`, `viewer` (+ `deny`)
- **Ressurser**: `pipeline`, `record`, `org`
- **Effekt**: `allow` (default) eller `deny` (eksplisitt) – *deny overrides*

## Beslutningslogikk (kort)
1. Finn bindings som matcher `tenant`, `user`/`group`, og evt. `resource.kind/id`.
2. Hvis noen binding har `effect=deny` (eller `role=deny`) → **deny**.
3. Finn høyeste rolle fra token (`x-roles`) og bindings.
4. Regler:
   - `admin`: alle handlinger
   - `manager`: `read/create/update` (ikke `delete`)
   - `contributor`: `read`, `create`, `update` **kun** hvis owner
   - `viewer`: `read` only

## Middleware
`enforce(action, resourceKind, resolveResource?)` på CRM-mutasjoner. Når `RBAC_ENFORCE=false` vil GET alltid passere.

## Admin-API
- `GET /api/v1/admin/rbac/bindings`
- `POST /api/v1/admin/rbac/bindings`
- `DELETE /api/v1/admin/rbac/bindings/:id`

Alle endringer auditeres som `rbac.policy.change` og teller `rbac_policy_change_total`.

## Observability
- Metrikker: `rbac_denied_total`, `rbac_policy_change_total`
- Dashboard: paneler for deny-rate og policy changes (se `ops/dashboards/workbuoy.json`).

## Integrasjon mot DB
Denne PR bruker en minne-store (`MemoryStore`). I prod bytt til DB-backed store (Prisma `RoleBinding` tabell) og skriv `DbStore` som implementerer `Store`-interfacet.
