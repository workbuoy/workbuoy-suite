import { prisma } from '../../core/db/prisma';
import { toPrismaJson } from '../../lib/prismaJson.js';
import type { RoleProfile } from '../types';

type RoleRow = {
  role_id: string;
  title: string | null;
  inherits: string[] | null;
  featureCaps: unknown;
  scopeHints: unknown;
  profile: unknown;
};

function mapRowToProfile(row: RoleRow): RoleProfile {
  const profile = (row.profile as unknown as RoleProfile | null) ?? ({} as RoleProfile);
  const featureCaps = (row.featureCaps as Record<string, number> | null) ?? profile.featureCaps;
  const scopeHints = (row.scopeHints as Record<string, any> | null) ?? profile.scopeHints;
  return {
    ...profile,
    role_id: row.role_id,
    canonical_title: profile.canonical_title ?? row.title,
    inherits: profile.inherits ?? row.inherits ?? [],
    featureCaps: featureCaps as RoleProfile['featureCaps'],
    scopeHints: scopeHints as RoleProfile['scopeHints'],
  };
}

export class RoleRepo {
  async list(): Promise<RoleProfile[]> {
    const rows = await prisma.role.findMany({ orderBy: { role_id: 'asc' } });
    return rows.map(mapRowToProfile);
  }

  async get(roleId: string): Promise<RoleProfile | null> {
    const row = await prisma.role.findUnique({ where: { role_id: roleId } });
    return row ? mapRowToProfile(row) : null;
  }

  async upsert(role: RoleProfile): Promise<RoleProfile> {
    const createData = {
      role_id: role.role_id,
      title: role.canonical_title ?? role.role_id,
      inherits: role.inherits ?? [],
      featureCaps: toPrismaJson(role.featureCaps),
      scopeHints: toPrismaJson(role.scopeHints),
      profile: toPrismaJson(role),
    };
    const args = {
      where: { role_id: role.role_id },
      create: createData,
      update: {
        title: role.canonical_title ?? role.role_id,
        inherits: role.inherits ?? [],
        featureCaps: toPrismaJson(role.featureCaps),
        scopeHints: toPrismaJson(role.scopeHints),
        profile: toPrismaJson(role),
      },
    } as any;
    const updated = await prisma.role.upsert(args);
    return mapRowToProfile(updated);
  }

  async upsertMany(roles: RoleProfile[]): Promise<number> {
    if (!roles.length) return 0;
    await prisma.$transaction(roles.map(role =>
      prisma.role.upsert({
        where: { role_id: role.role_id },
        create: {
          role_id: role.role_id,
          title: role.canonical_title ?? role.role_id,
          inherits: role.inherits ?? [],
          featureCaps: toPrismaJson(role.featureCaps),
          scopeHints: toPrismaJson(role.scopeHints),
          profile: toPrismaJson(role),
        },
        update: {
          title: role.canonical_title ?? role.role_id,
          inherits: role.inherits ?? [],
          featureCaps: toPrismaJson(role.featureCaps),
          scopeHints: toPrismaJson(role.scopeHints),
          profile: toPrismaJson(role),
        },
      }) as any
    ));
    return roles.length;
  }
}
