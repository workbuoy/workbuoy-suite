import prisma from '../src/db/prisma.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const requireFromHere = createRequire(import.meta.url);

type RoleItem = {
  role_id?: string;
  id?: string;
  name?: string;
  title?: string;
  canonical_title?: string;
  description?: string;
  summary?: string;
  inherits?: unknown;
  featureCaps?: unknown;
  scopeHints?: unknown;
  profile?: unknown;
};

type FeatureItem = {
  id?: string;
  key?: string;
  feature_id?: string;
  name?: string;
  title?: string;
  description?: string;
  defaultAutonomyCap?: unknown;
  capabilities?: unknown;
  metadata?: unknown;
};

async function loadJsonMaybe<T>(p?: string): Promise<T | null> {
  if (!p) return null;
  try {
    const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
    const buf = await fs.readFile(abs, 'utf8');
    return JSON.parse(buf) as T;
  } catch {
    return null;
  }
}

async function loadCatalog() {
  const rolesFromFile = await loadJsonMaybe<RoleItem[]>(process.env.ROLES_PATH);
  const featsFromFile = await loadJsonMaybe<FeatureItem[]>(process.env.FEATURES_PATH);
  if (Array.isArray(rolesFromFile) && Array.isArray(featsFromFile)) {
    return { roles: rolesFromFile, features: featsFromFile };
  }

  try {
    const rolesPath = requireFromHere.resolve('@workbuoy/roles-data/roles.json');
    const featuresPath = requireFromHere.resolve('@workbuoy/roles-data/features.json');
    const [rolesPkg, featuresPkg] = await Promise.all([
      loadJsonMaybe<RoleItem[]>(rolesPath),
      loadJsonMaybe<FeatureItem[]>(featuresPath),
    ]);
    if (Array.isArray(rolesPkg) && rolesPkg.length) {
      return {
        roles: rolesPkg,
        features: Array.isArray(featuresPkg) ? featuresPkg : [],
      };
    }
  } catch {
    // ignore
  }

  return {
    roles: [
      {
        role_id: 'admin',
        title: 'Administrator',
        description: 'Default administrator role',
      },
    ],
    features: [
      {
        id: 'crm-core',
        title: 'CRM Core',
        description: 'Core CRM feature',
        capabilities: ['crm.pipeline.read', 'crm.pipeline.write'],
      },
    ],
  };
}

type CountRow = { count: bigint };

async function isMigrated(client: typeof prisma): Promise<boolean> {
  try {
    const rows = await client.$queryRaw<CountRow[]>`
      SELECT count(*)::bigint AS count FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_name = '_prisma_migrations'
    `;
    if (!rows?.length || rows[0].count === 0n) return false;

    const applied = await client.$queryRaw<CountRow[]>`
      SELECT count(*)::bigint AS count FROM "_prisma_migrations"
    `;
    return (applied?.[0]?.count ?? 0n) >= 0n;
  } catch {
    return false;
  }
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  return text.length ? text : null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (value === null || value === undefined) {
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

function toJsonValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return undefined;
  }
  try {
    JSON.stringify(value);
    return value;
  } catch {
    return undefined;
  }
}

type NormalizedRole = {
  id: string;
  title: string;
  description: string | null;
  inherits: string[];
  featureCaps: unknown;
  scopeHints: unknown;
  profile: unknown;
};

type NormalizedFeature = {
  id: string;
  title: string;
  description: string | null;
  defaultAutonomyCap: number | undefined;
  capabilities: string[];
  metadata: unknown;
};

function normalizeRoles(raw: RoleItem[]): NormalizedRole[] {
  const dedup = new Map<string, NormalizedRole>();
  for (const role of raw) {
    const id =
      toStringOrNull(role.role_id) ??
      toStringOrNull(role.id) ??
      toStringOrNull(role.name) ??
      toStringOrNull(role.title) ??
      toStringOrNull(role.canonical_title);
    if (!id) {
      console.warn('[seed] skipping role without identifier', role);
      continue;
    }
    const title =
      toStringOrNull(role.title) ??
      toStringOrNull(role.name) ??
      toStringOrNull(role.canonical_title) ??
      id;
    const description =
      toStringOrNull(role.description) ?? toStringOrNull(role.summary);
    const inherits = Array.isArray(role.inherits)
      ? role.inherits.map((value) => String(value))
      : [];
    const normalized: NormalizedRole = {
      id,
      title,
      description,
      inherits,
      featureCaps: toJsonValue(role.featureCaps),
      scopeHints: toJsonValue(role.scopeHints),
      profile: toJsonValue(role.profile),
    };
    if (!dedup.has(id)) {
      dedup.set(id, normalized);
    }
  }
  return [...dedup.values()];
}

function normalizeFeatures(raw: FeatureItem[]): NormalizedFeature[] {
  const dedup = new Map<string, NormalizedFeature>();
  for (const feature of raw) {
    const id =
      toStringOrNull(feature.id) ??
      toStringOrNull(feature.feature_id) ??
      toStringOrNull(feature.key) ??
      toStringOrNull(feature.name);
    if (!id) {
      console.warn('[seed] skipping feature without identifier', feature);
      continue;
    }
    const title =
      toStringOrNull(feature.title) ??
      toStringOrNull(feature.name) ??
      id;
    const description = toStringOrNull(feature.description);
    const capabilities = toStringArray(feature.capabilities);
    const rawDefaultCap =
      typeof feature.defaultAutonomyCap === 'string'
        ? Number(feature.defaultAutonomyCap)
        : feature.defaultAutonomyCap;
    const defaultCap =
      typeof rawDefaultCap === 'number' && Number.isFinite(rawDefaultCap)
        ? rawDefaultCap
        : undefined;
    const normalized: NormalizedFeature = {
      id,
      title,
      description,
      defaultAutonomyCap: defaultCap,
      capabilities,
      metadata: toJsonValue(feature.metadata),
    };
    if (!dedup.has(id)) {
      dedup.set(id, normalized);
    }
  }
  return [...dedup.values()];
}

async function main() {
  const allowSeed = process.env.SEED === 'true' || process.env.NODE_ENV !== 'production';
  if (!allowSeed) {
    console.log('[seed] Skipping (prod w/o SEED=true)');
    return;
  }

  if (!(await isMigrated(prisma))) {
    console.warn(
      '[seed] No _prisma_migrations found; continuing (db:deploy already runs before this script).',
    );
  }

  const { roles, features } = await loadCatalog();
  const normalizedRoles = normalizeRoles(Array.isArray(roles) ? roles : []);
  const normalizedFeatures = normalizeFeatures(Array.isArray(features) ? features : []);

  await prisma.$transaction(async (tx) => {
    const systemTenant = await tx.tenant.upsert({
      where: { slug: 'system' },
      create: { slug: 'system', name: 'System' },
      update: { name: 'System' },
    });

    for (const feature of normalizedFeatures) {
      const createData = {
        id: feature.id,
        title: feature.title,
        ...(feature.description !== null
          ? { description: feature.description }
          : {}),
        ...(feature.defaultAutonomyCap !== undefined
          ? { defaultAutonomyCap: feature.defaultAutonomyCap }
          : {}),
        capabilities: feature.capabilities,
        ...(feature.metadata !== undefined ? { metadata: feature.metadata } : {}),
      } as const;

      const updateData = {
        title: feature.title,
        description: feature.description ?? null,
        ...(feature.defaultAutonomyCap !== undefined
          ? { defaultAutonomyCap: feature.defaultAutonomyCap }
          : {}),
        capabilities: feature.capabilities,
        ...(feature.metadata !== undefined ? { metadata: feature.metadata } : {}),
      } as const;

      await tx.feature.upsert({
        where: { id: feature.id },
        create: createData,
        update: updateData,
      });
    }

    for (const role of normalizedRoles) {
      const createData = {
        role_id: role.id,
        title: role.title,
        ...(role.description !== null ? { description: role.description } : {}),
        inherits: role.inherits,
        ...(role.featureCaps !== undefined ? { featureCaps: role.featureCaps } : {}),
        ...(role.scopeHints !== undefined ? { scopeHints: role.scopeHints } : {}),
        ...(role.profile !== undefined ? { profile: role.profile } : {}),
      } as const;

      const updateData = {
        title: role.title,
        description: role.description ?? null,
        inherits: role.inherits,
        ...(role.featureCaps !== undefined ? { featureCaps: role.featureCaps } : {}),
        ...(role.scopeHints !== undefined ? { scopeHints: role.scopeHints } : {}),
        ...(role.profile !== undefined ? { profile: role.profile } : {}),
      } as const;

      await tx.role.upsert({
        where: { role_id: role.id },
        create: createData,
        update: updateData,
      });
    }

    try {
      const admin = await tx.role.findUnique({ where: { role_id: 'admin' } });
      if (admin) {
        await tx.roleBinding.deleteMany({
          where: {
            tenantId: systemTenant.id,
            role: admin.role_id,
            group: 'system-admins',
          },
        });
        await tx.roleBinding.create({
          data: {
            tenantId: systemTenant.id,
            role: admin.role_id,
            group: 'system-admins',
          },
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '[unknown error while creating role binding]';
      console.warn('[seed] roleBinding table not available, skipping binding');
      console.warn(message);
    }
  });

  console.log(`[seed] Done: roles=${normalizedRoles.length}, features=${normalizedFeatures.length}`);
}

async function run() {
  let exitCode = 0;
  try {
    await main();
  } catch (err) {
    exitCode = 1;
    console.error('[seed] Failed:', err);
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectErr) {
      exitCode = 1;
      console.error('[seed] Failed to disconnect prisma:', disconnectErr);
    }
  }

  process.exit(exitCode);
}

run();
