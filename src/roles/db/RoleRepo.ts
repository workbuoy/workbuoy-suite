import { Prisma } from '@prisma/client';
import { prisma } from '../../core/db/prisma';
import type { RoleProfile } from '../types';

const toJsonInput = (v: unknown): any => v as any;

interface RoleRow {
  role_id: string;
  title: string;
  inherits: string[] | null;
  featureCaps: unknown;
  scopeHints: unknown;
  profile: unknown;
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
    const data = {
      role_id: role.role_id,
      title: role.canonical_title ?? role.role_id,
      inherits: role.inherits ?? [],
      featureCaps: role.featureCaps === undefined ? undefined : toJsonInput(role.featureCaps),
      scopeHints: role.scopeHints === undefined ? undefined : toJsonInput(role.scopeHints),
      profile: toJsonInput(role),
    };
    const updated = await prisma.role.upsert({
      where: { role_id: role.role_id },
      create: data,
      update: {
        title: role.canonical_title ?? role.role_id,
        inherits: role.inherits ?? [],
        featureCaps: role.featureCaps === undefined ? undefined : toJsonInput(role.featureCaps),
        scopeHints: role.scopeHints === undefined ? undefined : toJsonInput(role.scopeHints),
        profile: toJsonInput(role),
      },
    } as any);
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
          featureCaps: role.featureCaps === undefined ? undefined : toJsonInput(role.featureCaps),
          scopeHints: role.scopeHints === undefined ? undefined : toJsonInput(role.scopeHints),
          profile: toJsonInput(role),
        },
        update: {
          title: role.canonical_title ?? role.role_id,
          inherits: role.inherits ?? [],
          featureCaps: role.featureCaps === undefined ? undefined : toJsonInput(role.featureCaps),
          scopeHints: role.scopeHints === undefined ? undefined : toJsonInput(role.scopeHints),
          profile: toJsonInput(role),
        },
      })
    ));
    return roles.length;
  }
}
