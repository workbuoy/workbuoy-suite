Patch: fix ESM cycle in seed script by using tsx runner and lazy dynamic import.

Files:
- package.json (adds devDep 'tsx' and script 'seed:roles')
- .github/workflows/ci.yml (use 'npm run seed:roles' instead of node --loader ts-node/esm ...)
- scripts/seed-roles-from-json.ts (no shebang, lazy dynamic import, no extension imports)
- scripts/roles-io.ts (no extension in import path to match tsx)

How to apply:
1) Create a branch and unzip into repo root.
2) Commit and open PR. CI will run the seed step via `npm run seed:roles`.
