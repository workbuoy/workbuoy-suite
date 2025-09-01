# CRM-datamodell (MVP)

## Entiteter
### Pipeline
- `id` (string, PK)
- `tenant_id`
- `name`
- `created_at`, `updated_at` (epoch seconds)

### Stage
- `id` (string, PK)
- `tenant_id`
- `pipeline_id` → `Pipeline.id`
- `name`, `order`
- `created_at`, `updated_at`

### Contact
- `id` (string, PK)
- `tenant_id`
- `name`, `email`, `phone`
- `organization_id`, `owner_id`
- `custom_fields` (JSON)
- `created_at`, `updated_at`

### Opportunity
- `id` (string, PK)
- `tenant_id`
- `title`, `amount`
- `stage_id` (FK-ish), `contact_id`, `organization_id`, `owner_id`
- `custom_fields` (JSON)
- `created_at`, `updated_at`

## Indekser
- Alle tabeller: indeks på `tenant_id`
- `stages.pipeline_id`
- `contacts.updated_at` (implicit sort)

## RBAC
- Header-basert (MVP): `x-user-role` (`viewer|contributor|manager|admin`)
  - **read**: ≥ viewer
  - **write**: ≥ contributor
  - **admin**: admin
- Kan senere kobles mot full `RoleBinding`-modell.

## Import/eksport
- Import: JSON (`{ entity, items[] }`) eller multipart (CSV/JSON)
- Eksport: `json` (default) eller `csv`
