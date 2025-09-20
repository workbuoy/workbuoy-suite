import { prisma as defaultClient } from '../../core/db/prisma';
import type { OrgRoleOverride } from '../types';

type OverrideRecord = {
  tenantId: string;
  roleId: string;
  featureCaps: Record<string, number> | null;
  disabledFeatures: string[];
  notes?: string | null;
};

function toRecord(override: OrgRoleOverride): OverrideRecord {
  return {
    tenantId: override.tenantId,
    roleId: override.role_id,
    featureCaps: override.featureCaps ? { ...override.featureCaps } : null,
    disabledFeatures: override.disabledFeatures ?? [],
    notes: (override as any).notes ?? null,
  };
}

function fromRecord(row: any): OrgRoleOverride {
  return {
    tenantId: row.tenantId,
    role_id: row.roleId,
    featureCaps: (row.featureCaps as Record<string, number> | undefined) ?? undefined,
    disabledFeatures: row.disabledFeatures ?? [],
  };
}

export class OverrideRepo {
  constructor(private client: typeof defaultClient = defaultClient) {}

  async listOverrides(): Promise<OrgRoleOverride[]> {
    const rows = await (this.client as any).orgRoleOverride.findMany();
    return rows.map(fromRecord);
  }

  async listOverridesForTenant(tenantId: string): Promise<OrgRoleOverride[]> {
    const rows = await (this.client as any).orgRoleOverride.findMany({ where: { tenantId } });
    return rows.map(fromRecord);
  }

  async upsertOverride(tenantId: string, roleId: string, override: Partial<OrgRoleOverride>): Promise<void> {
    const data = toRecord({ tenantId, role_id: roleId, ...override });
    await (this.client as any).orgRoleOverride.upsert({
      where: { tenantId_roleId: { tenantId: data.tenantId, roleId: data.roleId } },
      create: data,
      update: { ...data },
    });
  }

  async deleteOverride(tenantId: string, roleId: string): Promise<void> {
    await (this.client as any).orgRoleOverride.delete({ where: { tenantId_roleId: { tenantId, roleId } } }).catch(() => {});
  }
}
