import { prisma as defaultClient } from '../../core/db/prisma';
import type { UserRoleBinding } from '../types';

type UserRoleRecord = {
  userId: string;
  primaryRole: string;
  secondaryRoles: string[];
};

function toRecord(binding: UserRoleBinding): UserRoleRecord {
  return {
    userId: binding.userId,
    primaryRole: binding.primaryRole,
    secondaryRoles: binding.secondaryRoles ?? [],
  };
}

function fromRecord(row: any): UserRoleBinding {
  return {
    userId: row.userId,
    primaryRole: row.primaryRole,
    secondaryRoles: row.secondaryRoles ?? [],
  };
}

export class UserRoleRepo {
  constructor(private client: typeof defaultClient = defaultClient) {}

  async getBinding(userId: string): Promise<UserRoleBinding | undefined> {
    const row = await (this.client as any).userRole.findUnique({ where: { userId } });
    return row ? fromRecord(row) : undefined;
  }

  async setBinding(binding: UserRoleBinding): Promise<void> {
    const data = toRecord(binding);
    await (this.client as any).userRole.upsert({
      where: { userId: data.userId },
      create: data,
      update: { ...data },
    });
  }

  async listBindingsForRole(roleId: string): Promise<UserRoleBinding[]> {
    const rows = await (this.client as any).userRole.findMany({
      where: {
        OR: [
          { primaryRole: roleId },
          { secondaryRoles: { has: roleId } },
        ],
      },
    });
    return rows.map(fromRecord);
  }
}
