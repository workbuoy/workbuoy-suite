// scripts/seed-roles-lib.ts
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveFeaturesSource, resolveRolesSource } from './roles-io.ts';
import type { FeatureDef, RoleProfile } from '../apps/backend/src/roles/types';

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
  const tsPath = path.resolve(process.cwd(), 'apps/backend/src/roles/service.ts');
  const jsPath = path.resolve(process.cwd(), 'apps/backend/dist/roles/service.js');

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
