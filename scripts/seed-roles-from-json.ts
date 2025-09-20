import { importRolesAndFeatures } from '../src/roles/seed/importer';

async function main() {
  try {
    const summary = await importRolesAndFeatures();
    console.log(`[seed] imported ${summary.roles} roles, ${summary.features} features`);
    process.exit(0);
  } catch (err: any) {
    console.error('[seed] failed to import roles', err?.message || err);
    process.exit(1);
  }
}

main();
