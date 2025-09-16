# PR2 – Health + Version (public)

- Implements GET /meta/health and GET /meta/version.
- Mount helper: `backend/api/meta.mount.ts` -> `mountMetaRoutes(app)`.
- Env inputs (optional):
  - `GIT_SHA`, `BUILD_ID`, `SEMVER`, `BUILT_AT`, `COMMIT_TIME`.
- Tests: jest + supertest under `tests/meta/health.version.test.ts`.
- Behavior: Always 200; health reports status 'ok' and process uptime.
