Fix CI seed step to avoid ts-node ESM cycle

What this patch does
- Adds an npm script "seed:roles" that runs seed with `tsx` (no loader cycles)
- Updates .github/workflows/ci.yml to call `npm run seed:roles`

How to apply
1) Create a new branch.
2) Unzip this archive into the repo root (overwriting existing files if prompted).
3) Commit and push, then open a PR.

Notes
- If you have multiple workflow files, ensure any other occurrences of
  `node --loader ts-node/esm scripts/seed-roles-from-json.ts` are replaced
  with `npm run seed:roles`.
- This patch does not modify your seed script itself.
