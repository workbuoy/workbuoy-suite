// scripts/seed-roles-lib.ts
import { resolveFeaturesSource, resolveRolesSource } from './roles-io.ts';

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

async function loadImporter(): Promise<(roles: any[], features: any[]) => Promise<{ roles: number; features: number }>> {
  const mod = await import('../src/roles/service');
  const fn = mod?.importRolesAndFeatures;
  if (typeof fn !== 'function') {
    throw new Error('importRolesAndFeatures not found in ../src/roles/service');
  }
  return fn;
}

export async function runSeed(): Promise<SeedSummary> {
  if (!shouldPersist()) {
    return { ok: true, skipped: 'FF_PERSISTENCE=false' };
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when FF_PERSISTENCE=true');
  }

  const rolesSource = resolveRolesSource();
  const featuresSource = resolveFeaturesSource();
  const importRolesAndFeatures = await loadImporter();
  const summary = await importRolesAndFeatures(rolesSource.data, featuresSource.data);
  console.log(`seeded {roles:${summary.roles}, features:${summary.features}}`);
  return {
    ok: true,
    summary,
    rolesPath: rolesSource.path,
    featuresPath: featuresSource.path,
  };
}

export async function seedRolesFromJson(): Promise<SeedSummary> {
  return runSeed();
}

export async function seedRoles(): Promise<SeedSummary> {
  return runSeed();
}

export { resolveRolesSource, resolveFeaturesSource };
