import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../core/db/prisma';
import { toPrismaJson } from '../../lib/prismaJson.js';
import type { RoleProfile } from '../types';

function mapRowToProfile(row: Role): RoleProfile {
  const profileJson = row.profile as Prisma.JsonValue | null;
  const featureCapsJson = row.featureCaps as Prisma.JsonValue | null;
  const scopeHintsJson = row.scopeHints as Prisma.JsonValue | null;

  const profile = (profileJson as Partial<RoleProfile> | null) ?? {};
  const featureCaps = (featureCapsJson as RoleProfile['featureCaps'] | null) ?? profile.featureCaps;
  const scopeHints = (scopeHintsJson as RoleProfile['scopeHints'] | null) ?? profile.scopeHints;
  const inherits = (profile.inherits ?? row.inherits ?? []) as RoleProfile['inherits'];

  return {
    ...profile,
    role_id: row.role_id as RoleProfile['role_id'],
    canonical_title: profile.canonical_title ?? row.title,
    inherits,
    featureCaps: featureCaps ?? undefined,
    scopeHints: scopeHints ?? undefined,
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
    const createData: Prisma.RoleCreateInput = {
      role_id: role.role_id,
      title: role.canonical_title ?? role.role_id,
      inherits: role.inherits ?? [],
      featureCaps: toPrismaJson(role.featureCaps) as Prisma.InputJsonValue,
      scopeHints: toPrismaJson(role.scopeHints) as Prisma.InputJsonValue,
      profile: toPrismaJson(role) as Prisma.InputJsonValue,
    };
    const args: Prisma.RoleUpsertArgs = {
      where: { role_id: role.role_id },
      create: createData,
      update: {
        title: role.canonical_title ?? role.role_id,
        inherits: role.inherits ?? [],
        featureCaps: toPrismaJson(role.featureCaps) as Prisma.InputJsonValue,
        scopeHints: toPrismaJson(role.scopeHints) as Prisma.InputJsonValue,
        profile: toPrismaJson(role) as Prisma.InputJsonValue,
      },
    };
    const updated = await prisma.role.upsert(args);
    return mapRowToProfile(updated);
  }

  async upsertMany(roles: RoleProfile[]): Promise<number> {
    if (!roles.length) return 0;
    await prisma.$transaction(
      roles.map(role =>
        prisma.role.upsert({
          where: { role_id: role.role_id },
          create: {
            role_id: role.role_id,
            title: role.canonical_title ?? role.role_id,
            inherits: role.inherits ?? [],
            featureCaps: toPrismaJson(role.featureCaps) as Prisma.InputJsonValue,
            scopeHints: toPrismaJson(role.scopeHints) as Prisma.InputJsonValue,
            profile: toPrismaJson(role) as Prisma.InputJsonValue,
          },
          update: {
            title: role.canonical_title ?? role.role_id,
            inherits: role.inherits ?? [],
            featureCaps: toPrismaJson(role.featureCaps) as Prisma.InputJsonValue,
            scopeHints: toPrismaJson(role.scopeHints) as Prisma.InputJsonValue,
            profile: toPrismaJson(role) as Prisma.InputJsonValue,
          },
        })
      )
    );
    return roles.length;
  }
}
