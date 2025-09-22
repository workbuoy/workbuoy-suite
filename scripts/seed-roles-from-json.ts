// scripts/seed-roles-from-json.ts
// This runner intentionally avoids importing ./seed-roles-lib.ts to prevent cycles when executed via ts-node/esm.
// It only uses local IO helpers and lazily imports the importer module after env/file checks.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { loadRolesFromRepo, loadFeaturesFromRepo } from './roles-io.ts';

const require = createRequire(import.meta.url);

function extendNodePath() {
  const backendNodeModules = path.resolve(process.cwd(), 'backend/node_modules');
  if (!fs.existsSync(backendNodeModules)) return;
  const existing = process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [];
  if (!existing.includes(backendNodeModules)) {
    const next = [...existing.filter(Boolean), backendNodeModules].join(path.delimiter);
    process.env.NODE_PATH = next;
    require('module').Module._initPaths();
  }
}

async function main() {
  const persist = (process.env.FF_PERSISTENCE || '').toLowerCase() === 'true';
  if (!persist) {
    console.log(JSON.stringify({ ok: true, skipped: 'FF_PERSISTENCE=false' }));
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when FF_PERSISTENCE=true');
  }

  extendNodePath();

  // IO first (no external imports)
  const rolesResult = loadRolesFromRepo();
  const featuresResult = loadFeaturesFromRepo();

  const rolesPath = rolesResult.path ?? '<unknown>';
  const featuresPath = featuresResult.path ?? '<default>';
  console.log(`[seed-roles-from-json] roles path: ${rolesPath}`);
  console.log(`[seed-roles-from-json] features path: ${featuresPath}`);

  // Lazy dynamic import after IO/env to avoid loader recursion
  let importer: any;
  let importerModule: string | null = null;
  const importerCandidates = [
    '../src/roles/service/importer.ts',
    '../src/roles/service/importer.js',
    '../src/roles/service.ts',
    '../src/roles/service.js',
  ];
  let lastError: unknown;
  for (const candidate of importerCandidates) {
    try {
      importer = await import(candidate);
      if (importer?.importRolesAndFeatures) {
        importerModule = candidate;
        break;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!importer?.importRolesAndFeatures) {
    if (lastError) {
      console.error('[seed-roles-from-json] importer load error:', lastError);
    }
    throw new Error('importRolesAndFeatures not found in importer module');
  }

  const summary = await importer.importRolesAndFeatures(rolesResult.data, featuresResult.data);
  console.log(
    JSON.stringify({
      ok: true,
      summary,
      rolesPath: rolesResult.path ?? null,
      featuresPath: featuresResult.path ?? null,
      importerModule,
    }),
  );
}

main().catch((err) => {
  console.error('[seed-roles-from-json] failed:', err?.stack || err?.message || String(err));
  process.exit(1);
});
