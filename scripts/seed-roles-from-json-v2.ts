import { seedRolesFromJson } from './seed-roles-lib.ts';

seedRolesFromJson()
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((err) => {
    console.error('[seed-roles-from-json-v2] failed:', err?.stack || err?.message || String(err));
    process.exit(1);
  });
