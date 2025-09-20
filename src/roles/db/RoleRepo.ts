import { prisma as defaultClient } from '../../core/db/prisma';
import type { RoleProfile } from '../types';

type RoleRecord = {
  roleId: string;
  title: string;
  inherits: string[];
  featureCaps: Record<string, number> | null;
  scopeHints: Record<string, any> | null;
  metadata: Record<string, any> | null;
};

function toRecord(role: RoleProfile): RoleRecord {
  const { role_id, canonical_title, inherits, featureCaps, scopeHints, ...rest } = role;
  const metadata = rest && Object.keys(rest).length ? rest : null;
  return {
    roleId: role_id,
    title: canonical_title,
    inherits: inherits ?? [],
    featureCaps: featureCaps ? { ...featureCaps } : null,
    scopeHints: scopeHints ? { ...scopeHints } : null,
    metadata: metadata ? { ...metadata } : null,
  };
}

function fromRecord(row: any): RoleProfile {
  const metadata = (row?.metadata as Partial<RoleProfile> | undefined) ?? {};
  const featureCaps = (row?.featureCaps as Record<string, number> | undefined) ?? metadata.featureCaps ?? {};
  const scopeHints = (row?.scopeHints as Record<string, any> | undefined) ?? metadata.scopeHints;
  return {
    ...metadata,
    role_id: row.roleId,
    canonical_title: row.title ?? metadata.canonical_title ?? row.roleId,
    inherits: row.inherits ?? metadata.inherits ?? [],
    featureCaps: featureCaps as RoleProfile['featureCaps'],
    scopeHints,
  };
}

export class RoleRepo {
  constructor(private client: typeof defaultClient = defaultClient) {}

  async listRoles(): Promise<RoleProfile[]> {
    const rows = await (this.client as any).role.findMany({ orderBy: { roleId: 'asc' } });
    return rows.map(fromRecord);
  }

  async getRole(roleId: string): Promise<RoleProfile | undefined> {
    const row = await (this.client as any).role.findUnique({ where: { roleId } });
    return row ? fromRecord(row) : undefined;
  }

  async upsertRole(role: RoleProfile): Promise<void> {
    const data = toRecord(role);
    await (this.client as any).role.upsert({
      where: { roleId: data.roleId },
      create: data,
      update: { ...data },
    });
  }

  async upsertMany(roles: RoleProfile[]): Promise<void> {
    if (!roles.length) return;
    await (this.client as any).$transaction(
      roles.map(role => {
        const data = toRecord(role);
        return (this.client as any).role.upsert({
          where: { roleId: data.roleId },
          create: data,
          update: { ...data },
        });
      })
    );
  }
}
