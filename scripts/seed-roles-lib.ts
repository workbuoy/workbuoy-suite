import { prisma } from '../apps/backend/src/core/db/prisma';
import { resolveRolesSource, resolveFeaturesSource } from './roles-io.ts';

export interface SeedSummary {
  ok: true;
  summary?: { roles: number; features: number };
  skipped?: string;
  rolesPath?: string;
  featuresPath?: string;
}

const roleKey = (r: any) => r?.role_id ?? r?.id ?? r?.slug ?? r?.name ?? r?.title;
const featureKey = (f: any) => f?.id ?? f?.feature_id ?? f?.key ?? f?.slug ?? f?.name ?? f?.title;

function shouldPersist(): boolean {
  return (process.env.FF_PERSISTENCE || '').toLowerCase() === 'true';
}

async function loadImporter(): Promise<(r: any[], f: any[]) => Promise<{ roles: number; features: number }>> {
  const mod = await import('../apps/backend/src/roles/service/index.ts');
  const fn = (mod as any)?.importRolesAndFeatures;
  if (typeof fn !== 'function') throw new Error('importRolesAndFeatures not found in backend roles service');
  return fn;
}

async function raceWithTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error(`[seed] ${label} timed out after ${ms}ms`)), ms);
  });
  try {
    const res = await Promise.race([p, timeout]);
    return res as T;
  } finally {
    if (t) clearTimeout(t);
  }
}

const toStringOrUndefined = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const stringified = String(value).trim();
  return stringified.length ? stringified : undefined;
};

const toNumberOrUndefined = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const asStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const mapped = value
    .map((entry) => toStringOrUndefined(entry))
    .filter((entry): entry is string => Boolean(entry));
  return mapped.length ? mapped : [];
};

const defined = <T extends Record<string, unknown>>(value: T): T => {
  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as T;
};

function buildRolePayload(role: any, roleId: string) {
  const title = toStringOrUndefined(role?.title ?? role?.name) ?? roleId;
  const inherits = asStringArray(role?.inherits);
  const featureCaps = role?.featureCaps ?? role?.capabilities ?? undefined;
  const scopeHints = role?.scopeHints ?? undefined;
  const profile = role?.profile ?? undefined;

  return {
    create: defined({
      role_id: roleId,
      title,
      ...(inherits ? { inherits } : {}),
      ...(featureCaps !== undefined ? { featureCaps } : {}),
      ...(scopeHints !== undefined ? { scopeHints } : {}),
      ...(profile !== undefined ? { profile } : {}),
    }),
    update: defined({
      title,
      ...(inherits ? { inherits } : {}),
      ...(featureCaps !== undefined ? { featureCaps } : {}),
      ...(scopeHints !== undefined ? { scopeHints } : {}),
      ...(profile !== undefined ? { profile } : {}),
    }),
  };
}

function buildFeaturePayload(feature: any, featureId: string) {
  const title = toStringOrUndefined(feature?.title ?? feature?.name) ?? featureId;
  const description = feature?.description ?? null;
  const defaultAutonomyCap = toNumberOrUndefined(feature?.defaultAutonomyCap);
  const capabilities = asStringArray(feature?.capabilities) ?? [];
  const metadata = feature?.metadata ?? undefined;

  return {
    create: defined({
      id: featureId,
      title,
      description,
      ...(defaultAutonomyCap !== undefined ? { defaultAutonomyCap } : {}),
      capabilities,
      ...(metadata !== undefined ? { metadata } : {}),
    }),
    update: defined({
      title,
      description,
      ...(defaultAutonomyCap !== undefined ? { defaultAutonomyCap } : {}),
      ...(capabilities.length ? { capabilities } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
    }),
  };
}

/** fallback: minimal upsert using Prisma if service import hangs */
async function fastSeedPrisma(roles: any[], features: any[]) {
  console.log('[seed:fallback] using direct Prisma upserts');

  try {
    await prisma.$executeRawUnsafe('SET statement_timeout = 10000');
  } catch {}

  let roleCount = 0;
  const processedRoles = new Set<string>();
  for (const role of roles) {
    const key = roleKey(role);
    if (!key) continue;
    const roleId = String(key);
    if (processedRoles.has(roleId)) continue;
    processedRoles.add(roleId);
    const payload = buildRolePayload(role, roleId);
    await prisma.role.upsert({
      where: { role_id: roleId },
      create: payload.create,
      update: payload.update,
    });
    roleCount += 1;
  }

  let featureCount = 0;
  const processedFeatures = new Set<string>();
  for (const feature of features) {
    const key = featureKey(feature);
    if (!key) continue;
    const featureId = String(key);
    if (processedFeatures.has(featureId)) continue;
    processedFeatures.add(featureId);
    const payload = buildFeaturePayload(feature, featureId);
    await prisma.feature.upsert({
      where: { id: featureId },
      create: payload.create,
      update: payload.update,
    });
    featureCount += 1;
  }

  return { roles: roleCount, features: featureCount };
}

export async function seedRolesFromJson(): Promise<SeedSummary> {
  return runSeed();
}

export async function runSeed(): Promise<SeedSummary> {
  if (!shouldPersist()) {
    console.log('[seed] FF_PERSISTENCE=false – skipping');
    return { ok: true, skipped: 'FF_PERSISTENCE=false' };
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when FF_PERSISTENCE=true');
  }

  const rolesSrc = resolveRolesSource();
  const featsSrc = resolveFeaturesSource();

  const importRolesAndFeatures = await loadImporter();

  console.log('[seed] importing roles/features via service (10s timeout)…');

  let summary: { roles: number; features: number } | undefined;

  try {
    summary = await raceWithTimeout(
      importRolesAndFeatures(rolesSrc.data, featsSrc.data),
      10_000,
      'service import',
    );
    console.log(`[seed] service import done {roles:${summary.roles}, features:${summary.features}}`);
  } catch (err) {
    console.warn(
      '[seed] service import failed or timed out – switching to Prisma fallback:',
      (err as Error)?.message,
    );
    summary = await fastSeedPrisma(rolesSrc.data, featsSrc.data);
    console.log(`[seed] fallback done {roles:${summary.roles}, features:${summary.features}}`);
  } finally {
    try {
      await prisma.$disconnect();
      console.log('[seed] prisma disconnected');
    } catch {}
  }

  return {
    ok: true,
    summary,
    rolesPath: rolesSrc.path,
    featuresPath: featsSrc.path,
  };
}
