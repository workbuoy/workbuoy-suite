# META — Production-Safe Meta System

Stages: **Analyzer → Planner → Backlog → Propose → Approve → Apply → Rollback**

- Backlog API: `/api/meta/backlog` (GET/POST)
- Propose API: `/api/meta/propose` (POST) — records proposal
- Approve API: `/api/meta/approve` (POST) — logs approval
- Apply API: `/api/meta/apply` (POST) — snapshots `/config/*` and writes `PROPOSED.patch.json`
- Rollback API: `/api/meta/rollback` (POST) — removes patch; all steps audit-logged and WORMed
