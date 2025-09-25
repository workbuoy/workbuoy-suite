Repository Structure
====================

```
.
├─ apps/        # first-party product surfaces
├─ connectors/  # integrations and sync agents
├─ crm/         # CRM-specific services and assets
├─ desktop/     # desktop runtime and packaging
├─ docs/        # guides, ADRs, and reference material
├─ enterprise/  # enterprise-only extensions
├─ packages/    # shared libraries consumed across workspaces
├─ sdk/         # SDKs and developer tooling
└─ telemetry/   # metrics pipelines and dashboards
```

Legacy or experimental workspaces that previously lived at the repository root have been moved to `docs/archive/` to keep the active layout easy to scan. See [docs/ARCHIVE.md](ARCHIVE.md) for details and guidance on retrieving historical context.

Shared configuration continues to live alongside the workspaces (for example `tsconfig.base.json`, `.eslintrc.cjs`, and `.spectral.yaml`). CI workflows remain under `.github/workflows/` and operate unchanged by this reorganization.
