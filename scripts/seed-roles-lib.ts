import { prisma } from '../apps/backend/src/core/db/prisma';
import { resolveRolesSource, resolveFeaturesSource } from './roles-io.ts';

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
  let t: any;
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error(`[seed] ${label} timed out after ${ms}ms`)), ms);
  });
  try {
    const res = await Promise.race([p, timeout]);
    return res as T;
  } finally {
    clearTimeout(t);
  }
}

/** fallback: minimal upsert using Prisma if service import hangs */
async function fastSeedPrisma(roles: any[], features: any[]) {
  console.log('[seed:fallback] using direct Prisma upserts');

  // best effort: shorten long queries
  try {
    await prisma.$executeRawUnsafe('SET statement_timeout = 10000');
  } catch {}

  let roleCount = 0;
  for (const r of roles) {
    // accept either {role_id,id,name} or {slug,...}
    const id = r.role_id || r.id || r.slug || r.name;
    if (!id) continue;
    await prisma.role.upsert({
      where: { role_id: String(id) },
      create: {
        role_id: String(id),
        title: r.name ?? r.title ?? String(id),
        // tolerate optional fields from fixtures
        inherits: Array.isArray(r.inherits) ? r.inherits : undefined,
        featureCaps: r.featureCaps ?? undefined,
        scopeHints: r.scopeHints ?? undefined,
        profile: r.profile ?? undefined,
      },
      update: {
        title: r.name ?? r.title ?? String(id),
        inherits: Array.isArray(r.inherits) ? r.inherits : undefined,
        featureCaps: r.featureCaps ?? undefined,
        scopeHints: r.scopeHints ?? undefined,
        profile: r.profile ?? undefined,
      },
    });
    roleCount++;
  }

  let featureCount = 0;
  for (const f of features) {
    const id = f.feature_id || f.id || f.key || f.slug || f.name;
    if (!id) continue;
    await prisma.feature.upsert({
      where: { feature_id: String(id) },
      create: {
        feature_id: String(id),
        name: f.name ?? String(id),
        description: f.description ?? null,
      },
      update: {
        name: f.name ?? String(id),
        description: f.description ?? null,
      },
    });
    featureCount++;
  }

  return { roles: roleCount, features: featureCount };
}

export async function seedRolesFromJson() {
  return runSeed();
}

export async function runSeed(): Promise<{ ok: true; summary?: any; skipped?: string }> {
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
    // try normal path with timeout
    summary = await raceWithTimeout(
      importRolesAndFeatures(rolesSrc.data, featsSrc.data),
      10_000,
      'service import',
    );
    console.log(`[seed] service import done {roles:${summary.roles}, features:${summary.features}}`);
  } catch (err) {
    console.warn('[seed] service import failed or timed out – switching to Prisma fallback:', (err as Error)?.message);
    summary = await fastSeedPrisma(rolesSrc.data, featsSrc.data);
    console.log(`[seed] fallback done {roles:${summary.roles}, features:${summary.features}}`);
  } finally {
    try {
      await prisma.$disconnect();
      console.log('[seed] prisma disconnected');
    } catch {}
  }

  return { ok: true, summary };
}
