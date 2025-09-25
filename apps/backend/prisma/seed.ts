import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

type RoleInput = {
  role_id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  [key: string]: unknown;
};

type FeatureInput = {
  id?: string;
  feature_id?: string;
  title?: string;
  name?: string;
  description?: string;
  capabilities?: unknown;
  [key: string]: unknown;
};

export interface SeedSummary {
  roles: number;
  features: number;
  dryRun: boolean;
}

const prisma = new PrismaClient();

const prismaDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(prismaDir, '..');
const repoRoot = path.resolve(workspaceRoot, '..', '..');

const DEFAULT_ROLES_PATH = path.join('scripts', 'fixtures', 'minimal-roles.json');
const DEFAULT_FEATURES_PATH = path.join('scripts', 'fixtures', 'minimal-features.json');

function envOrDefault(name: string, fallback: string): string {
  const value = process.env[name];
  if (value && value.trim().length) {
    return value.trim();
  }
  return fallback;
}

function resolveInputPath(rawPath: string): string {
  if (path.isAbsolute(rawPath)) {
    return rawPath;
  }

  const workspaceCandidate = path.resolve(workspaceRoot, rawPath);
  if (existsSync(workspaceCandidate)) {
    return workspaceCandidate;
  }

  const repoCandidate = path.resolve(repoRoot, rawPath);
  if (existsSync(repoCandidate)) {
    return repoCandidate;
  }

  return workspaceCandidate;
}

function readJSON<T = unknown>(targetPath: string, label: string): T {
  try {
    const raw = readFileSync(targetPath, 'utf8');
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`[seed] failed to read ${label} from ${targetPath}: ${(err as Error).message}`);
  }
}

function toStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const normalized = String(value).trim();
  return normalized.length ? normalized : undefined;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (value === undefined || value === null) {
    return [];
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
  return [];
}

async function upsertRoles(roles: RoleInput[], dryRun: boolean): Promise<number> {
  if (!roles.length) {
    return 0;
  }

  const seen = new Set<string>();
  let processed = 0;

  for (const role of roles) {
    const roleId = toStringOrUndefined(role.role_id ?? role.id ?? role.name);
    if (!roleId) {
      console.warn('[seed] skip role without id:', role);
      continue;
    }
    if (seen.has(roleId)) {
      continue;
    }
    seen.add(roleId);

    const title = toStringOrUndefined(role.title ?? role.name) ?? roleId;
    const description = toStringOrUndefined(role.description);

    if (!dryRun) {
      await prisma.role.upsert({
        where: { role_id: roleId },
        create: {
          role_id: roleId,
          title,
          description: description ?? undefined,
        },
        update: {
          title,
          description: description ?? undefined,
        },
      });
    }

    processed += 1;
  }

  return processed;
}

async function upsertFeatures(features: FeatureInput[], dryRun: boolean): Promise<number> {
  if (!features.length) {
    return 0;
  }

  const seen = new Set<string>();
  let processed = 0;

  for (const feature of features) {
    const featureId = toStringOrUndefined(feature.id ?? feature.feature_id ?? feature.name);
    if (!featureId) {
      console.warn('[seed] skip feature without id:', feature);
      continue;
    }
    if (seen.has(featureId)) {
      continue;
    }
    seen.add(featureId);

    const title = toStringOrUndefined(feature.title ?? feature.name) ?? featureId;
    const description = toStringOrUndefined(feature.description);
    const rawCapabilities = feature.capabilities;
    const capabilities = toStringArray(rawCapabilities);

    if (rawCapabilities === undefined || rawCapabilities === null) {
      console.warn(`[seed] feature ${featureId}: missing 'capabilities' → defaulting to []`);
    } else if (!Array.isArray(rawCapabilities) && typeof rawCapabilities !== 'string') {
      console.warn(
        `[seed] feature ${featureId}: invalid 'capabilities' type (${typeof rawCapabilities}) → defaulting to []`,
      );
    }

    if (!dryRun) {
      await prisma.feature.upsert({
        where: { id: featureId },
        create: {
          id: featureId,
          title,
          description: description ?? undefined,
          capabilities,
        },
        update: {
          title,
          description: description ?? undefined,
          capabilities,
        },
      });
    }

    processed += 1;
  }

  return processed;
}

export async function seed(): Promise<SeedSummary> {
  const dryRun = String(process.env.SEED_DRY_RUN || '').toLowerCase() === 'true';

  if (!dryRun && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set unless SEED_DRY_RUN=true');
  }

  const rolesPathInput = envOrDefault('ROLES_PATH', DEFAULT_ROLES_PATH);
  const featuresPathInput = envOrDefault('FEATURES_PATH', DEFAULT_FEATURES_PATH);

  const rolesPath = resolveInputPath(rolesPathInput);
  const featuresPath = resolveInputPath(featuresPathInput);

  const rolesFileExists = existsSync(rolesPath);
  const featuresFileExists = existsSync(featuresPath);

  if (!rolesFileExists) {
    console.warn(`[seed] roles file not found at ${rolesPath}`);
  }
  if (!featuresFileExists) {
    console.warn(`[seed] features file not found at ${featuresPath}`);
  }

  const rolesData = rolesFileExists ? readJSON<unknown>(rolesPath, 'roles') : [];
  const featuresData = featuresFileExists ? readJSON<unknown>(featuresPath, 'features') : [];

  const roles = Array.isArray(rolesData) ? (rolesData as RoleInput[]) : [];
  const features = Array.isArray(featuresData) ? (featuresData as FeatureInput[]) : [];

  if (rolesFileExists && !Array.isArray(rolesData)) {
    console.warn(`[seed] roles payload is not an array at ${rolesPath}`);
  }
  if (featuresFileExists && !Array.isArray(featuresData)) {
    console.warn(`[seed] features payload is not an array at ${featuresPath}`);
  }
  console.log(`[seed] configuration rolesPath=${rolesPath} featuresPath=${featuresPath} dryRun=${dryRun}`);

  const summary: SeedSummary = {
    roles: 0,
    features: 0,
    dryRun,
  };

  summary.roles = await upsertRoles(Array.isArray(roles) ? roles : [], dryRun);
  summary.features = await upsertFeatures(Array.isArray(features) ? features : [], dryRun);

  return summary;
}

async function disconnectPrismaSafely(): Promise<unknown | null> {
  try {
    await prisma.$disconnect();
    return null;
  } catch (disconnectError) {
    console.warn('[seed] prisma disconnect failed:', disconnectError);
    return disconnectError;
  }
}

export async function runSeed(options?: { dryRun?: boolean }): Promise<SeedSummary> {
  if (options?.dryRun) {
    process.env.SEED_DRY_RUN = 'true';
  }

  let caughtError: unknown;

  try {
    return await seed();
  } catch (err) {
    caughtError = err;
    throw err;
  } finally {
    const disconnectError = await disconnectPrismaSafely();
    if (!caughtError && disconnectError) {
      throw disconnectError;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const argDryRun = args.some((arg) => arg === '--dry-run' || arg === '--dryRun');
  let npmDryRun = false;

  const npmArgv = process.env.npm_config_argv;
  if (npmArgv) {
    try {
      const parsed = JSON.parse(npmArgv) as { original?: unknown };
      const original = parsed.original;
      if (Array.isArray(original)) {
        npmDryRun = original.some((arg) => arg === '--dry-run' || arg === '--dryRun');
      }
    } catch (err) {
      console.warn('[seed] failed to parse npm_config_argv:', err);
    }
  }

  if (argDryRun || npmDryRun) {
    process.env.SEED_DRY_RUN = 'true';
  }

  console.log('[seed] starting…');
  const result = await seed();
  console.log(`[seed] roles=${result.roles}, features=${result.features}, dryRun=${result.dryRun}`);
}

const modulePath = fileURLToPath(import.meta.url);
const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
const isDirectExecution = entryPath === modulePath;

if (isDirectExecution) {
  let exitCode = 0;

  main()
    .then(() => {
      console.log('[seed] completed successfully');
    })
    .catch((err) => {
      exitCode = 1;
      console.error('[seed] failed:', err);
    })
    .finally(async () => {
      const disconnectError = await disconnectPrismaSafely();
      if (!exitCode && disconnectError) {
        exitCode = 1;
      }
      process.exit(exitCode);
    });
}
