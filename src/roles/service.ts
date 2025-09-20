import { envBool } from '../core/env';
import { loadFeaturesFromRepo, loadRolesFromRepo } from './loader';
import { RoleRegistry } from './registry';
import type { FeatureDef, OrgRoleOverride, RoleProfile, UserRoleBinding } from './types';
import { RoleRepo } from './db/RoleRepo';
import { FeatureRepo } from './db/FeatureRepo';
import { OverrideRepo } from './db/OverrideRepo';
import { UserRoleRepo } from './db/UserRoleRepo';

const roleRepo = new RoleRepo();
const featureRepo = new FeatureRepo();
const overrideRepo = new OverrideRepo();
const userRoleRepo = new UserRoleRepo();

const CACHE_TTL_MS = 15_000;
let cached: { registry: RoleRegistry; loadedAt: number } | null = null;

function usePersistence(): boolean {
  return envBool('FF_PERSISTENCE', false);
}

async function loadFromDb(): Promise<{ roles: RoleProfile[]; features: FeatureDef[]; overrides: OrgRoleOverride[] }> {
  const [roles, features, overrides] = await Promise.all([
    roleRepo.list(),
    featureRepo.list(),
    overrideRepo.list(),
  ]);
  const hydratedFeatures = features.length ? features : loadFeaturesFromRepo();
  return { roles, features: hydratedFeatures, overrides };
}

async function loadStatic(): Promise<{ roles: RoleProfile[]; features: FeatureDef[]; overrides: OrgRoleOverride[] }> {
  return {
    roles: loadRolesFromRepo(),
    features: loadFeaturesFromRepo(),
    overrides: [],
  };
}

async function buildRegistry(): Promise<RoleRegistry> {
  const source = usePersistence() ? await loadFromDb() : await loadStatic();
  return new RoleRegistry(source.roles, source.features, source.overrides);
}

export async function getRoleRegistry(opts: { refresh?: boolean } = {}): Promise<RoleRegistry> {
  if (!cached || opts.refresh || Date.now() - cached.loadedAt > CACHE_TTL_MS) {
    const registry = await buildRegistry();
    cached = { registry, loadedAt: Date.now() };
  }
  return cached.registry;
}

export async function refreshRoleRegistry(): Promise<RoleRegistry> {
  cached = null;
  return getRoleRegistry({ refresh: true });
}

export async function resolveUserBinding(tenantId: string, userId: string, fallback: UserRoleBinding | undefined): Promise<UserRoleBinding | undefined> {
  if (!usePersistence()) return fallback;
  if (!userId) return fallback;
  const binding = await userRoleRepo.get(userId, tenantId);
  return binding ?? fallback;
}

export async function listRoles(): Promise<RoleProfile[]> {
  if (usePersistence()) return roleRepo.list();
  return loadRolesFromRepo();
}

export async function listFeatures(): Promise<FeatureDef[]> {
  if (usePersistence()) return featureRepo.list();
  return loadFeaturesFromRepo();
}

export async function listOverridesForTenant(tenantId: string): Promise<OrgRoleOverride[]> {
  if (!usePersistence()) return [];
  return overrideRepo.listForTenant(tenantId);
}

export async function setOverride(tenantId: string, roleId: string, override: Partial<OrgRoleOverride>): Promise<OrgRoleOverride> {
  const row = await overrideRepo.set(tenantId, roleId, override);
  await refreshRoleRegistry();
  return row;
}

export async function upsertRoleBinding(tenantId: string, binding: UserRoleBinding): Promise<UserRoleBinding> {
  const saved = await userRoleRepo.set(tenantId, binding);
  return saved;
}

export async function importRolesAndFeatures(roles: RoleProfile[], features: FeatureDef[]): Promise<{ roles: number; features: number }> {
  const roleCount = await roleRepo.upsertMany(roles);
  const featureCount = await featureRepo.upsertMany(features);
  await refreshRoleRegistry();
  return { roles: roleCount, features: featureCount };
}
