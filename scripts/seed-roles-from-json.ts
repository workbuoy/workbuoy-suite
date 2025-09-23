// scripts/seed-roles-from-json.ts
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { seedRolesFromJson } from './seed-roles-lib.ts';
import type { ImportRolesAndFeatures } from './seed-roles-lib.ts';

function getBackendRoot(): string {
  const cwd = process.cwd();
  if (path.basename(cwd) === 'backend' && path.basename(path.dirname(cwd)) === 'apps') {
    return cwd;
  }
  const candidate = path.resolve(cwd, 'apps/backend');
  return candidate;
}

async function loadImporter(): Promise<ImportRolesAndFeatures> {
  const backendRoot = getBackendRoot();
  const candidates = [
    path.join(backendRoot, 'src/roles/service.ts'),
    path.join(backendRoot, 'src/roles/service/index.ts'),
    path.join(backendRoot, 'src/roles/service/importer.ts'),
    path.join(backendRoot, 'src/roles/service.mts'),
    path.join(backendRoot, 'src/roles/service.js'),
    path.join(backendRoot, 'dist/roles/service.js'),
    path.join(backendRoot, 'dist/roles/service.mjs'),
  ];
  let lastErr: unknown;
  for (const candidate of candidates) {
    try {
      const mod = await import(pathToFileURL(candidate).href);
      const fn = mod?.importRolesAndFeatures;
      if (typeof fn === 'function') {
        return fn as ImportRolesAndFeatures;
      }
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error('importRolesAndFeatures not found in backend roles service', {
    cause: lastErr as any,
  });
}

async function main() {
  try {
    const importRolesAndFeatures = await loadImporter();
    const result = await seedRolesFromJson(importRolesAndFeatures);
    if (result.summary) {
      console.log(
        JSON.stringify({
          ok: true,
          summary: result.summary,
          rolesPath: result.rolesPath,
          featuresPath: result.featuresPath,
        })
      );
    } else {
      console.log(JSON.stringify(result));
    }
  } catch (err: any) {
    console.error('[seed-roles-from-json] failed:', err?.stack || err?.message || String(err));
    process.exit(1);
  }
}

main();
