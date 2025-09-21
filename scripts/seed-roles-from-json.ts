// scripts/seed-roles-from-json.ts
import { loadRolesFromRepo, loadFeaturesFromRepo } from './roles-io';

async function main() {
  if ((process.env.FF_PERSISTENCE || '').toLowerCase() !== 'true') {
    console.log(JSON.stringify({ ok: true, skipped: 'FF_PERSISTENCE=false' }));
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when FF_PERSISTENCE=true');
  }

  const roles = loadRolesFromRepo();
  const features = loadFeaturesFromRepo();

  // Lazy import AFTER IO/env checks to avoid loader cycles
  const { importRolesAndFeatures } = await import('../src/roles/service/importer');

  const summary = await importRolesAndFeatures(roles, features);
  console.log(JSON.stringify({ ok: true, summary }));
}

main().catch((err) => {
  console.error('[seed-roles-from-json] failed:', err?.message || String(err));
  process.exit(1);
});
