import type { FeatureDef, RoleProfile } from '../types.js';
import { loadServiceModule } from './loader.js';

export type ImportRolesAndFeatures = (
  roles: RoleProfile[],
  features: FeatureDef[]
) => Promise<{ roles: number; features: number }>;

function ensureImporter(mod: Record<string, unknown>): ImportRolesAndFeatures {
  const fn = mod?.importRolesAndFeatures;
  if (typeof fn !== 'function') {
    throw new Error('importRolesAndFeatures export missing from src/roles/service');
  }
  return fn as ImportRolesAndFeatures;
}

export async function importRolesAndFeatures(
  roles: RoleProfile[],
  features: FeatureDef[]
): Promise<{ roles: number; features: number }> {
  const mod = await loadServiceModule();
  return ensureImporter(mod)(roles, features);
}
