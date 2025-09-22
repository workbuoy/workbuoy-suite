import { loadRolesFromRepo, loadFeaturesFromRepo, resolveRolesPath, resolveFeaturesPath } from './roles-io';

async function main() {
  const persist = (process.env.FF_PERSISTENCE || '').toLowerCase() === 'true';
  if (!persist) {
    console.log(JSON.stringify({ ok: true, skipped: 'FF_PERSISTENCE=false' }));
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when FF_PERSISTENCE=true');
  }

  const rolesPath = resolveRolesPath();
  const featuresPath = resolveFeaturesPath() || '';
  console.log(`[seed-roles] using rolesPath=${rolesPath} featuresPath=${featuresPath || '(none)'}`);

  const roles = loadRolesFromRepo();
  const features = loadFeaturesFromRepo();

  const importer =
    (await import('../src/roles/service/importer').catch(() => null)) ||
    (await import('../src/roles/service/importer.ts').catch(() => null)) ||
    (await import('../src/roles/service/importer.js').catch(() => null));

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
