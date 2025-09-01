# CRM Datamodell + RBAC + Audit

## Entiteter
- Tenant, User, Organization, Contact, Pipeline, Stage, Opportunity, Activity
- CustomFieldDef, CustomFieldValue
- RoleBinding, AuditLog

## API
- GET /api/v1/crm/opportunities
- POST /api/v1/crm/opportunities

## RBAC
- Guard på tenant + rolle i RoleBinding
- Roller: admin, manager, contributor, viewer

## Audit
- Mutasjoner lagres i AuditLog + eksport til fil (fra PR L)

## Testing
```bash
DATABASE_URL="file:dev.db?connection_limit=1" npx prisma migrate dev --name init
npm test
```
