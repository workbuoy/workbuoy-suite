# CI Notes

- Primary apps live under `apps/backend` and `apps/frontend`.

## Guards

- `repo-guards` workflow enforces no tracked `node_modules`.
- Run locally with `npm run guard:ban-tracked-deps` if you suspect large working copies.

### Size report

- `npm run size:report` captures working tree size (GiB), counts `node_modules` folders, and total file count after `npm ci`.
- Thresholds are enforced as warnings via `tools/size-thresholds.ts` (defaults: `SIZE_MAX_GB=2.6`, `NODE_MODULES_MAX=220`, `FILES_MAX=150000`).
- GitHub Actions posts a non-blocking PR comment summarizing the metrics and diffs versus the previous run. Override thresholds by setting the corresponding env vars on the workflow/job.

## Typical pipeline

CI performs a full dependency install (`npm ci`) before running jobs so every workspace, including optional ones, is available during validation.

1. Repo guards
2. Typecheck (`npm run typecheck`)
3. Unit tests (`npm test`)
4. (Optional) Seed verification (`npm run seed:roles || true`)

If CI reports tracked `node_modules`, remove files from Git history and re-commit:

```bash
git rm -r --cached path/to/offending/node_modules
echo 'node_modules/' >> .gitignore
git commit -m "chore(gitignore): ignore node_modules"
```

## Linting Policy

- Root ESLint config at `.eslintrc.cjs` is the single source of truth.
- Blocking: `apps/**` (CI uses `npm run lint:apps` with `--max-warnings=0`).
- Non-blocking report: entire repo (satellites) via `npm run lint` (CI job continues on error).

## Prettier

- Format files: `npm run format`
- Check formatting: `npm run format:check`

## Containers

We build multi-stage images for backend (Node runtime) and frontend (Nginx runtime).

CI runs a non-blocking Trivy scan for both images and publishes CycloneDX SBOM artifacts.

For local builds:

```bash
docker build -t workbuoy-backend:dev ./apps/backend
docker run --rm -p 3000:3000 workbuoy-backend:dev
docker build -t workbuoy-frontend:dev ./apps/frontend
docker run --rm -p 8080:80 workbuoy-frontend:dev
```

## Helm & Kubernetes Validation

- CI runs Helm lint for `deploy/helm/workbuoy`.
- CI renders manifests via `helm template` (using `values.ci.yaml` when present).
- CI validates YAML against Kubernetes schemas using `kubeconform` (`-strict -summary`).
- Currently non-blocking (report-only). Flip `continue-on-error` off once charts stabilize.

## OpenAPI Quality Gates

- **Lint:** Run Spectral (`@stoplight/spectral-cli`) against any `openapi.yaml|yml|json` under `apps/**` or `**/openapi/**`.
- **Diff vs main:** Generate a report with `openapi-diff` to surface potential breaking changes.
- Both steps are non-blocking right now (report-first). We may flip to blocking once specs stabilize.

### Local usage

```bash
npm run openapi:lint
npm run openapi:diff
```

Governance & Automated Updates

CODEOWNERS routes reviews automatically:

- apps/backend/** → backend owners
- apps/frontend/** → frontend owners
- deploy/** → platform/devops owners
- types/**, tools/**, .github/workflows/** → platform owners

Dependabot:

- Runs weekly for npm (root + workspaces) and GitHub Actions.
- Groups common deps (types, testing, linting, build-tools) to reduce PR noise.
- Caps concurrent PRs to keep review load manageable.
- Labels: dependencies, plus ecosystem tags (npm, actions).

## Docs housekeeping

Legacy references updated to `apps/backend` and `apps/frontend`.

See also: [Asset Policy](ASSET_POLICY.md), [ADR Guide](adr/README.md).
