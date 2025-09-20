#!/usr/bin/env ts-node
import path from 'node:path';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../src/roles/loader';
import { importRolesAndFeatures } from '../src/roles/service';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set to run the seed');
  }
  process.env.FF_PERSISTENCE = process.env.FF_PERSISTENCE ?? 'true';

  const roles = loadRolesFromRepo();
  const features = loadFeaturesFromRepo();
  if (!roles.length) {
    throw new Error(`roles.json not found in ${path.resolve(process.cwd(), 'roles/roles.json')}`);
  }

  const summary = await importRolesAndFeatures(roles, features);
  console.log(JSON.stringify({ ok: true, imported: summary }));
}

main().catch(err => {
  console.error('[seed-roles-from-json] failed:', err);
  process.exit(1);
});
