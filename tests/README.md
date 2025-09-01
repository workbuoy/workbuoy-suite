# Test Suite Overview

This folder contains *executable definitions* and *templates* to wire into CI:

- `tests/roles/test_roles_schema.py` — validates `core/roles/roles.json` (required fields + unique IDs).
- `tests/saas/smoke_saas.yaml` — curl-based health/readyz/openapi checks (requires `API_BASE_URL`).
- `tests/crm/smoke_crm.yaml` — CRM list/import smoke (requires `API_KEY` + `API_BASE_URL`).
- `tests/desktop/e2e_desktop_conflict_load.yaml` — desktop E2E flow (SQLCipher probe + build + conflict/load).

> These are ready to run in CI. For local execution, translate YAML `run:` lines into shell commands or add a small runner.
