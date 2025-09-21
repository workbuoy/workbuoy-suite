// scripts/seed-roles-from-json.ts
// ESM entrypoint: run with
//   node --loader ts-node/esm scripts/seed-roles-from-json.ts
import { seedRolesFromJson } from './seed-roles-lib.js'; // ts-node/esm resolves .ts too

seedRolesFromJson()
  .then((res) => {
    console.log(JSON.stringify({ ok: true, ...res }));
  })
  .catch((err) => {
    console.error('[seed-roles-from-json] failed:', err);
    process.exit(1);
  });
