//!/usr/bin/env node
// scripts/seed-roles-from-json.ts
// Run with: npm run seed:roles

import { loadRolesFromRepo, loadFeaturesFromRepo } from './roles-io.ts';

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

  // Dynamically import importer (prefer built JS; fall back to TS in dev)
  let importer: any;
  try {
    importer = await import('../src/roles/service/importer.js');
  } catch {
    importer = await import('../src/roles/service/importer.ts');
  }
  const { importRolesAndFeatures } = importer;
  const summary = await importRolesAndFeatures(roles, features);
  console.log(JSON.stringify({ ok: true, summary }));
}

main().catch((err) => {
  console.error('[seed-roles-from-json] failed:', err?.message || String(err));
  process.exit(1);
});
