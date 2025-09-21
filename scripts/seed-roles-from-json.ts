#!/usr/bin/env node
// scripts/seed-roles-from-json.ts
import { seedRoles } from './seed-roles-lib.ts';

(async () => {
  try {
    const res = await seedRoles();
    console.log(JSON.stringify({ ok: true, result: res }));
    process.exit(0);
  } catch (err) {
    console.error('[seed-roles-from-json] failed:', err?.message || String(err));
    process.exit(1);
  }
})();
