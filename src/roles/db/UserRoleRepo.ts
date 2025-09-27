import { prisma } from '../../core/db/prisma';
import type { UserRoleBinding } from '../types';

const toPrismaJson = (value: unknown): any => (value === null ? (null as any) : (value as any));

type UserRoleRow = {
  user_id: string;
  tenant_id: string;
  primaryRole: string | null;
  secondaryRoles: unknown;
};

function mapRow(row: UserRoleRow): UserRoleBinding {
  return {
    userId: row.user_id,
    primaryRole: row.primaryRole as UserRoleBinding['primaryRole'],
    secondaryRoles: (row.secondaryRoles as UserRoleBinding['secondaryRoles']) ?? [],
  };
}

export class UserRoleRepo {
  async get(userId: string, tenantId: string): Promise<UserRoleBinding | null> {
    const row = await prisma.userRole.findUnique({ where: { user_id: userId } });
    if (!row) return null;
    if (row.tenant_id !== tenantId) return null;
    return mapRow(row);
  }

  async listForTenant(tenantId: string): Promise<UserRoleBinding[]> {
    const rows = await prisma.userRole.findMany({ where: { tenant_id: tenantId } });
    return rows.map(mapRow);
  }

  async set(tenantId: string, binding: UserRoleBinding): Promise<UserRoleBinding> {
    const row = await prisma.userRole.upsert({
      where: { user_id: binding.userId },
      create: {
        user_id: binding.userId,
        tenant_id: tenantId,
        primaryRole: binding.primaryRole,
        secondaryRoles: toPrismaJson(binding.secondaryRoles ?? []),
      },
      update: {
        tenant_id: tenantId,
        primaryRole: binding.primaryRole,
        secondaryRoles: toPrismaJson(binding.secondaryRoles ?? []),
      },
    });
    return mapRow(row);
  }
}
