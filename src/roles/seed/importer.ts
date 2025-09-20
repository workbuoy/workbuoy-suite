import { loadRolesFromRepo, loadFeaturesFromRepo } from '../loader';
import { RoleRepo } from '../db/RoleRepo';
import { FeatureRepo } from '../db/FeatureRepo';

export interface ImportSummary {
  roles: number;
  features: number;
}

export async function importRolesAndFeatures(): Promise<ImportSummary> {
  const roles = loadRolesFromRepo();
  const features = loadFeaturesFromRepo();
  const roleRepo = new RoleRepo();
  const featureRepo = new FeatureRepo();
  await Promise.all([roleRepo.upsertMany(roles), featureRepo.upsertMany(features)]);
  return { roles: roles.length, features: features.length };
}
