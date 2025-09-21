Workbuoy Suite — CI Fix Patch (Wave 1)
=====================================

This patch addresses:
1) TS typecheck failing due to missing '@types/jest' and missing 'types' in tsconfig.meta.json.
2) Seed script ESM require cycle by refactoring the runner to avoid importing seed-roles-lib.ts.

Files included (relative to repo root):
- package.json                      (adds devDep @types/jest)
- tsconfig.meta.json                (adds compilerOptions.types = ['jest','node'])
- scripts/roles-io.ts               (new — JSON helpers extracted)
- scripts/seed-roles-from-json.ts   (updated — imports roles-io and uses dynamic import of importer)

How to apply
------------
1) Create a new branch, then copy files over the repo root:
   unzip wb-wave1-ci-fixes.zip -d /path/to/your/checkout

2) Install dependencies at repo root:
   npm install

3) (Optional) Format:
   npx prettier -w tsconfig.meta.json scripts/*.ts

4) Run typecheck locally:
   npm run typecheck

5) Commit & push, open PR:
   git add -A
   git commit -m "fix(ci): jest types + seed script esm refactor"
   git push -u origin <your-branch>
