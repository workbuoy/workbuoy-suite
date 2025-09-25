# CI Notes

- Primary apps live under `apps/backend` and `apps/frontend`.

## Guards

- `repo-guards` workflow enforces no tracked `node_modules`.
- Run locally with `npm run guard:ban-tracked-deps` if you suspect large working copies.

## Typical pipeline

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
