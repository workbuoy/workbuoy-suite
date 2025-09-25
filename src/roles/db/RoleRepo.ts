import type { Prisma, Role as RoleRow } from '@prisma/client';
import { prisma } from '../../core/db/prisma';
import type { RoleProfile } from '../types';

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

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
    const data: Prisma.RoleUpsertArgs['create'] = {
      role_id: role.role_id,
      title: role.canonical_title ?? role.role_id,
      inherits: role.inherits ?? [],
      featureCaps: toJson(role.featureCaps),
      scopeHints: toJson(role.scopeHints),
      profile: toJson(role),
    };
    const updated = await prisma.role.upsert({
      where: { role_id: role.role_id },
      create: data,
      update: {
        title: role.canonical_title ?? role.role_id,
        inherits: role.inherits ?? [],
        featureCaps: toJson(role.featureCaps),
        scopeHints: toJson(role.scopeHints),
        profile: toJson(role),
      },
    });
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
          featureCaps: toJson(role.featureCaps),
          scopeHints: toJson(role.scopeHints),
          profile: toJson(role),
        },
        update: {
          title: role.canonical_title ?? role.role_id,
          inherits: role.inherits ?? [],
          featureCaps: toJson(role.featureCaps),
          scopeHints: toJson(role.scopeHints),
          profile: toJson(role),
        },
      })
    ));
    return roles.length;
  }
}
