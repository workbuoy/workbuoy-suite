// scripts/seed-roles-lib.ts
import { resolveFeaturesSource, resolveRolesSource } from './roles-io.ts';
import type { FeatureDef, RoleProfile } from '../src/roles/types';

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

type ImportRolesAndFeatures = (
  roles: RoleProfile[],
  features: FeatureDef[]
) => Promise<{ roles: number; features: number }>;

async function loadImporter(): Promise<ImportRolesAndFeatures> {
  const mod = await import('../src/roles/service');
  const fn = mod?.importRolesAndFeatures;
  if (typeof fn !== 'function') {
    throw new Error('importRolesAndFeatures not found in ../src/roles/service');
  }
  return fn as ImportRolesAndFeatures;
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
