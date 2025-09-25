import { runSeed } from '../apps/backend/prisma/seed.ts';

runSeed()
  .then((result) => {
    console.log(JSON.stringify(result));
    process.exit(0);
  })
  .catch((err) => {
    console.error('[seed-roles-from-json-v2] failed:', err?.stack || err?.message || String(err));
    process.exit(1);
  });
