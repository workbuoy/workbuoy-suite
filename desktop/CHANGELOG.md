# Changelog

## 2.0.0-finalready - 2025-08-27
- Phase G → Final Ready: workflows, cross-org, plugins → OIDC/RBAC, conflict LWW + audit hooks, roaming, OTEL, packaging, CI, docs, tests.


## 2.0.1-hardenv2 - 2025-08-27
- Plugin-signering (verify on enable) + badge i UI.
- Audit-queue (persist + retry/backoff) med metrics.
- Structured JSON logger (feltmaskering) + unit tests.
- RBAC `wb:rbac:can` IPC og gating-støtte.
- CRDT pilot-strategi med metrics.
- Dash-vindu med streng CSP + metrics snapshot.
- E2E-utvidelser for org-switch, plugins, AI-insights, telemetry.


## 2.0.2-pro-ready - 2025-08-27
- RBAC-enforcement i main for sensitive IPC.
- Audit-queue: backoff/jitter + single-flight-lock + sanitering.
- Plugin verify IPC + galleri bruker ekte signaturstatus.
- Release: manifester + checksums publiseres.
- E2E: telemetry-opt fix, RBAC deny og verify-badge tester.
- CRDT: per-org API (setStrategyForOrg/resolveWithOrg).
- Dash: metrics snapshot IPC allerede koblet; meny/tray kan åpne vindu.
