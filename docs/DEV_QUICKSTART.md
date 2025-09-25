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

   ### Light bootstrap
   Run `npm run bootstrap:light` to install all core workspaces but omit optional deps and heavy devDependencies.  
   Use `npm ci` for a full install (required in CI).

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
