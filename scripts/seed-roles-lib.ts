// scripts/seed-roles-lib.ts
// Safe, no-throw seeding helper. Intended for CI and local bootstrap.
// - Reads roles/roles.json and roles/features.json if present.
// - If FF_PERSISTENCE!=='true' or Prisma is unavailable, it exits gracefully.
// - If Prisma exists and DATABASE_URL is set, it attempts idempotent upserts.
// - Never throws on missing files or client; returns a summary object.
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

export type RoleItem = {
  role_id: string;
  title?: string;
  inherits?: string[];
  feature_caps?: Record<string, number>;
  scope_hints?: Record<string, unknown>;
};

export type FeatureItem = {
  id: string;
  title?: string;
  description?: string;
  default_autonomy_cap?: number;
  capabilities?: string[];
};

function fileExists(p: string) { try { return fs.existsSync(p); } catch { return false; } }
function readJson<T=any>(p: string, fallback: T): T {
  try { if (fileExists(p)) return JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
  return fallback;
}

function repoRoot(): string {
  // heuristics: current working dir
  return process.cwd();
}

async function tryImportPrisma(): Promise<any | null> {
  try {
    // dynamic import to avoid hard ESM/CJS coupling
    const mod = await import('@prisma/client');
    // @ts-ignore
    const { PrismaClient } = mod as any;
    // @ts-ignore
    return new PrismaClient();
  } catch {
    return null;
  }
}

function normalizeRoles(input: unknown): RoleItem[] {
  if (!Array.isArray(input)) return [];
  return input.map((r: any) => ({
    role_id: String(r.role_id ?? r.id ?? ''),
    title: r.title ?? r.name,
    inherits: Array.isArray(r.inherits) ? r.inherits.map(String) : [],
    feature_caps: typeof r.feature_caps === 'object' && r.feature_caps ? r.feature_caps : {},
    scope_hints: typeof r.scope_hints === 'object' && r.scope_hints ? r.scope_hints : {},
  })).filter(x => x.role_id);
}

function normalizeFeatures(input: unknown): FeatureItem[] {
  if (!Array.isArray(input)) return [];
  return input.map((f: any) => ({
    id: String(f.id ?? f.feature_id ?? ''),
    title: f.title ?? f.name,
    description: f.description ?? '',
    default_autonomy_cap: Number.isFinite(f.default_autonomy_cap) ? Number(f.default_autonomy_cap) : undefined,
    capabilities: Array.isArray(f.capabilities) ? f.capabilities.map(String) : [],
  })).filter(x => x.id);
}

export async function seedRolesFromJson() {
  const cwd = repoRoot();
  const rolesPath = path.join(cwd, 'roles', 'roles.json');
  const featuresPath = path.join(cwd, 'roles', 'features.json');

  const rolesRaw = readJson(rolesPath, [] as any[]);
  const featuresRaw = readJson(featuresPath, [] as any[]);
  const roles = normalizeRoles(rolesRaw);
  const features = normalizeFeatures(featuresRaw);

  const summary: any = {
    ok: true,
    ff_persistence: process.env.FF_PERSISTENCE ?? 'false',
    had_prisma: false,
    used_db: false,
    files: {
      rolesJson: fileExists(rolesPath),
      featuresJson: fileExists(featuresPath),
    },
    counts: {
      roles: roles.length,
      features: features.length,
      upserts: { roles: 0, features: 0 },
    }
  };

  // If persistence is not enabled, exit happily.
  if ((process.env.FF_PERSISTENCE ?? 'false').toString().toLowerCase() !== 'true') {
    summary.reason = 'FF_PERSISTENCE!=true';
    return summary;
  }

  // Need Prisma + DATABASE_URL to actually upsert
  const prisma = await tryImportPrisma();
  if (!prisma || !process.env.DATABASE_URL) {
    summary.had_prisma = !!prisma;
    summary.reason = !process.env.DATABASE_URL ? 'DATABASE_URL missing' : 'prisma missing';
    return summary;
  }
  summary.had_prisma = true;

  // Attempt idempotent upserts – guarded in try/catch to avoid failing CI.
  try {
    // Roles table (best-effort mapping)
    for (const r of roles) {
      try {
        // @ts-ignore dynamic model names assumed
        await prisma.role.upsert({
          where: { role_id: r.role_id },
          update: {
            title: r.title,
            inherits: r.inherits ?? [],
            feature_caps: r.feature_caps ?? {},
            scope_hints: r.scope_hints ?? {},
          },
          create: {
            role_id: r.role_id,
            title: r.title ?? r.role_id,
            inherits: r.inherits ?? [],
            feature_caps: r.feature_caps ?? {},
            scope_hints: r.scope_hints ?? {},
          },
        });
        summary.counts.upserts.roles++;
      } catch {}
    }

    // Features table
    for (const f of features) {
      try {
        // @ts-ignore
        await prisma.feature.upsert({
          where: { id: f.id },
          update: {
            title: f.title,
            description: f.description,
            default_autonomy_cap: f.default_autonomy_cap ?? null,
            capabilities: f.capabilities ?? [],
          },
          create: {
            id: f.id,
            title: f.title ?? f.id,
            description: f.description ?? '',
            default_autonomy_cap: f.default_autonomy_cap ?? null,
            capabilities: f.capabilities ?? [],
          },
        });
        summary.counts.upserts.features++;
      } catch {}
    }

    summary.used_db = true;
  } catch (e) {
    summary.db_error = String((e as Error).message || e);
  } finally {
    try { await prisma.$disconnect?.(); } catch {}
  }

  return summary;
}

if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  // If executed directly (node --loader ts-node/esm scripts/seed-roles-lib.ts)
  seedRolesFromJson()
    .then((res) => { console.log(JSON.stringify(res)); process.exit(0); })
    .catch((err) => { console.error('[seed-roles-lib] failed:', err); process.exit(1); });
}
