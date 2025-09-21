import { selectRepo } from '../../core/persist/select';

export type OverrideRow = { tenant_id: string; role_id: string; feature_caps?: Record<string, number>; disabled_features?: string[] };

export class OverrideRepoV2 {
  static async open(){
    try {
      if (process.env.FF_PERSISTENCE === 'true') {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        return {
          async set(tenant: string, roleId: string, feature_caps: any, disabled_features: any){
            return prisma.orgRoleOverride.upsert({
              where: { tenant_id_role_id: { tenant_id: tenant, role_id: roleId } },
              update: { feature_caps, disabled_features },
              create: { tenant_id: tenant, role_id: roleId, feature_caps, disabled_features }
            });
          },
          async get(tenant: string, roleId: string){
            return prisma.orgRoleOverride.findUnique({ where: { tenant_id_role_id: { tenant_id: tenant, role_id: roleId } } });
          }
        };
      }
    } catch {}
    const repo = selectRepo<OverrideRow>('org_role_overrides');
    return {
      async set(tenant: string, roleId: string, feature_caps: any, disabled_features: any){
        const row: OverrideRow = { tenant_id: tenant, role_id: roleId, feature_caps, disabled_features };
        await repo.upsert(row as any); return row;
      },
      async get(tenant: string, roleId: string){
        const all = await repo.all(); return all.find(r => r.tenant_id===tenant && r.role_id===roleId) as any;
      }
    };
  }
}
