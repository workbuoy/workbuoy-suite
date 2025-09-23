import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JsonParseError, resolveFeaturesSource, resolveRolesSource } from './roles-io';

export type SeedSummary = {
  roles: number;
  features: number;
};

export type SeedResult = {
  ok: boolean;
  skipped?: string | boolean;
  summary?: SeedSummary;
  rolesPath?: string;
  featuresPath?: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeRoles(input: any): any[] {
  if (Array.isArray(input?.roles)) return input.roles;
  if (Array.isArray(input)) return input;
  return [];
}

function normalizeFeatures(input: any): any[] {
  if (Array.isArray(input?.features)) return input.features;
  if (Array.isArray(input)) return input;
  return [];
}

export async function runSeed(): Promise<SeedResult> {
  const persistence = (process.env.FF_PERSISTENCE ?? 'false').toLowerCase();
  if (persistence !== 'true') {
    return { ok: true, skipped: 'FF_PERSISTENCE!=true' };
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when FF_PERSISTENCE=true');
  }

  let rolesSource;
  let featuresSource;
  try {
    rolesSource = resolveRolesSource();
    featuresSource = resolveFeaturesSource();
  } catch (error) {
    if (error instanceof JsonParseError) {
      throw error;
    }
    throw new Error(`Failed to resolve role sources: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!rolesSource) {
    return { ok: true, skipped: 'roles source missing', featuresPath: featuresSource?.path };
  }

  const roles = normalizeRoles(rolesSource.data);
  const features = normalizeFeatures(featuresSource?.data);

  console.log(`[seed-roles] roles source -> ${rolesSource.path}`);
  if (featuresSource) {
    console.log(`[seed-roles] features source -> ${featuresSource.path}`);
  } else {
    console.log('[seed-roles] no features source found');
  }

  const servicePath = path.relative(process.cwd(), path.resolve(__dirname, '../backend/src/roles/service'));
  console.log(`[seed-roles] importer -> ${servicePath}`);
  let summary: SeedSummary | undefined;
  try {
    const mod = await import(`../backend/src/roles/service`);
    const importer = (mod as any).importRolesAndFeatures;
    if (typeof importer !== 'function') {
      throw new Error('backend roles service missing importRolesAndFeatures export');
    }
    const result = await importer(roles, features);
    if (result && typeof result === 'object') {
      summary = {
        roles: Number((result as any).roles ?? roles.length) || roles.length,
        features: Number((result as any).features ?? features.length) || features.length,
      };
    }
  } catch (error) {
    throw new Error(
      `Failed to import backend roles service (${servicePath}): ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return {
    ok: true,
    summary: summary ?? { roles: roles.length, features: features.length },
    rolesPath: rolesSource.path,
    featuresPath: featuresSource?.path,
  };
}

