# Repo Guards

- `npm run guard:ban-tracked-deps` — fails if any `node_modules/**` paths are tracked by Git.
- Use this locally before commits when you suspect accidental dependency check-ins.

- `npm run guard:orphan-workspaces` — lists `package.json` files that live outside the configured npm workspaces (non-blocking).
