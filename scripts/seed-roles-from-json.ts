// scripts/seed-roles-from-json.ts
// This runner intentionally avoids importing ./seed-roles-lib.ts to prevent cycles when executed via ts-node/esm.
// It only uses local IO helpers and lazily imports the importer module after env/file checks.

import { loadRolesFromRepo, loadFeaturesFromRepo } from './roles-io.ts';

async function main() {
  const persist = (process.env.FF_PERSISTENCE || '').toLowerCase() === 'true';
  if (!persist) {
    console.log(JSON.stringify({ ok: true, skipped: 'FF_PERSISTENCE=false' }));
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when FF_PERSISTENCE=true');
  }

  // IO first (no external imports)
  const roles = loadRolesFromRepo();
  const features = loadFeaturesFromRepo();

  // Lazy dynamic import after IO/env to avoid loader recursion
  let importer: any;
  try {
    importer = await import('../src/roles/service/importer.ts');
  } catch {
    importer = await import('../src/roles/service/importer.js');
  }

  if (!importer?.importRolesAndFeatures) {
    throw new Error('importRolesAndFeatures not found in importer module');
  }

  const summary = await importer.importRolesAndFeatures(roles, features);
  console.log(JSON.stringify({ ok: true, summary }));
}

main().catch((err) => {
  console.error('[seed-roles-from-json] failed:', err?.stack || err?.message || String(err));
  process.exit(1);
});
