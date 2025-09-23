// scripts/seed-roles-lib.ts
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveFeaturesSource, resolveRolesSource } from './roles-io.ts';
import type { FeatureDef, RoleProfile } from '../apps/backend/src/roles/types';

function getBackendRoot(): string {
  const cwd = process.cwd();
  if (path.basename(cwd) === 'backend' && path.basename(path.dirname(cwd)) === 'apps') {
    return cwd;
  }
  const candidate = path.resolve(cwd, 'apps/backend');
  return candidate;
}

export interface SeedSummary {
  ok: true;
  summary?: { roles: number; features: number };
  skipped?: string;
  rolesPath?: string;
  featuresPath?: string;
}

function shouldPersist(): boolean {
  return (process.env.FF_PERSISTENCE || '').toLowerCase() === 'true';
}

export type ImportRolesAndFeatures = (
  roles: RoleProfile[],
  features: FeatureDef[]
) => Promise<{ roles: number; features: number }>;

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

export async function runSeed(importer?: ImportRolesAndFeatures): Promise<SeedSummary> {
  if (!shouldPersist()) {
    return { ok: true, skipped: 'FF_PERSISTENCE=false' };
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when FF_PERSISTENCE=true');
  }

  const rolesSource = resolveRolesSource();
  const featuresSource = resolveFeaturesSource();
  const importRolesAndFeatures = importer ?? (await loadImporter());
  const summary = await importRolesAndFeatures(rolesSource.data, featuresSource.data);
  console.log(`seeded {roles:${summary.roles}, features:${summary.features}}`);
  return {
    ok: true,
    summary,
    rolesPath: rolesSource.path,
    featuresPath: featuresSource.path,
  };
}

export async function seedRolesFromJson(importer?: ImportRolesAndFeatures): Promise<SeedSummary> {
  return runSeed(importer);
}

export async function seedRoles(importer?: ImportRolesAndFeatures): Promise<SeedSummary> {
  return runSeed(importer);
}

export { resolveRolesSource, resolveFeaturesSource };
