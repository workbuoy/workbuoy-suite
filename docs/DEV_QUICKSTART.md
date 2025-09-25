Developer Quickstart
====================

1. Install dependencies
   ```
   npm run clean
   ```
   Choose an install mode:

   - **Full install (default / CI)**
     ```
     npm ci
     ```
     Installs every workspace, including the heavy `enterprise/` and `crm/` apps. This is the mode used by CI and should be used when you need all applications locally.

   - **Light install (skip heavy apps)**
     ```
     npm run bootstrap:light
     ```
     Runs `npm ci` with `--omit=optional` to skip optional workspaces. Use this for a faster local setup when you do not need the enterprise or CRM apps.

   > `npm run clean` uses `git clean -fdx` to reset the working tree; this removes untracked files and directories.

2. Verify
   ```
   npm run typecheck
   npm test
   npm run seed:dry-run -w @workbuoy/backend
   ```

3. Run locally
   ```
   # Backend
   npm run -w @workbuoy/backend dev   # or start
   # Frontend
   npm run -w @workbuoy/frontend dev
   ```

4. Lint & format
   ```
   npm run lint:apps
   npm run format:check
   ```

5. Containers (optional)
   ```
   docker build -f apps/backend/Dockerfile -t wb-backend:dev .
   docker build -f apps/frontend/Dockerfile -t wb-frontend:dev .
   ```

See also: [CI Notes](CI_NOTES.md), [Structure](STRUCTURE.md), [Asset Policy](ASSET_POLICY.md).
