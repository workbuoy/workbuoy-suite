ADR 0001: Retire legacy dynamic server loader

Status: Accepted
Date: 2025-09-25

Context

The repo carried a dynamic Express loader under src/ that mounted legacy and workspace modules, obscuring boundaries.

Decision

Remove dynamic loader and define explicit routes/modules under apps/backend.

Consequences

Clear dependency graph and ownership.

Simpler deploys and audits.

Requires updating any callers that referenced old paths.
