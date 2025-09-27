import type { OrgRoleOverride as OrgRoleOverrideModel, Prisma } from '@prisma/client';
import { prisma } from '../../core/db/prisma';
import { toPrismaJson } from '../../lib/prismaJson.js';
import type { OrgRoleOverride } from '../types';

function mapRow(row: OrgRoleOverrideModel): OrgRoleOverride {
  const featureCapsJson = row.featureCaps as Prisma.JsonValue | null;
  return {
    tenantId: row.tenant_id,
    role_id: row.role_id as OrgRoleOverride['role_id'],
    featureCaps: (featureCapsJson as OrgRoleOverride['featureCaps']) ?? undefined,
    disabledFeatures: row.disabledFeatures ?? [],
  };
}

export class OverrideRepo {
  async list(): Promise<OrgRoleOverride[]> {
    const rows = await prisma.orgRoleOverride.findMany();
    return rows.map(mapRow);
  }

  async listForTenant(tenantId: string): Promise<OrgRoleOverride[]> {
    const rows = await prisma.orgRoleOverride.findMany({ where: { tenant_id: tenantId } });
    return rows.map(mapRow);
  }

  async get(tenantId: string, roleId: string): Promise<OrgRoleOverride | null> {
    const row = await prisma.orgRoleOverride.findUnique({ where: { tenant_id_role_id: { tenant_id: tenantId, role_id: roleId } } });
    return row ? mapRow(row) : null;
  }

  async set(tenantId: string, roleId: string, override: Partial<OrgRoleOverride>): Promise<OrgRoleOverride> {
    const args: Prisma.OrgRoleOverrideUpsertArgs = {
      where: { tenant_id_role_id: { tenant_id: tenantId, role_id: roleId } },
      create: {
        tenant_id: tenantId,
        role_id: roleId,
        featureCaps: toPrismaJson(override.featureCaps) as Prisma.InputJsonValue,
        disabledFeatures: override.disabledFeatures ?? [],
      },
      update: {
        featureCaps: toPrismaJson(override.featureCaps) as Prisma.InputJsonValue,
        disabledFeatures: override.disabledFeatures ?? [],
      },
    };
    const row = await prisma.orgRoleOverride.upsert(args);
    return mapRow(row);
  }
}
