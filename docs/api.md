# API Overview

Dette er OpenAPI-spesifikasjonene som matcher dagens in-memory-API-er:

- **CRM**: `openapi/crm.yaml` – `/api/crm/contacts`
- **Tasks**: `openapi/tasks.yaml` – `/api/tasks`
- **Log**: `openapi/log.yaml` – `/api/logs`, `/api/audit/verify`
- **Buoy**: `openapi/buoy.yaml` – `/buoy/complete`

## Lint i CI
Workflow: `.github/workflows/openapi-lint.yml` (Spectral). Første iterasjoner er non-blocking (bruker `|| true`).

## Kontrakt ↔️ kode
Når ruter endres, oppdater spes samtidig i samme PR. UX bruker disse spesene i klienten og dokumentasjonen linker hit.
