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
  const tsPath = path.join(backendRoot, 'src/roles/service.ts');
  const jsPath = path.join(backendRoot, 'dist/roles/service.js');

  try {
    const tsMod = await import(pathToFileURL(tsPath).href);
    const tsFn = tsMod?.importRolesAndFeatures;
    if (typeof tsFn === 'function') {
      return tsFn as ImportRolesAndFeatures;
    }
  } catch {}

  const jsMod = await import(pathToFileURL(jsPath).href);
  const jsFn = jsMod?.importRolesAndFeatures;
  if (typeof jsFn !== 'function') {
    throw new Error('importRolesAndFeatures not exported by backend roles service');
  }
  return jsFn as ImportRolesAndFeatures;
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
