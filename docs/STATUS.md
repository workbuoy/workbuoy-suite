# STATUS — Cleanup landing (2025-09-15)
- Consolidated mounts in `src/server.ts` (export-only). Runtime: `src/bin/www.ts`.
- Health: /healthz, readiness: /readyz, build info: /buildz
- Debug (dev): /api/_debug/dlq, /api/_debug/circuit
- OpenAPI specs present for CRM/Tasks/Log/Finance/Buoy/Manual
- CI: OpenAPI lint (non-blocking), backend coverage (non-blocking)
