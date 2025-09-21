import { selectRepo } from '../../core/persist/select';

export type RoleRow = {
  role_id: string;
  title?: string;
  inherits?: string[];
  feature_caps?: Record<string, number>;
  scope_hints?: Record<string, any>;
};

export class RoleRepoV2 {
  static async open(){
    // try Prisma
    try {
      if (process.env.FF_PERSISTENCE === 'true') {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        return {
          async upsert(row: RoleRow){ return prisma.role.upsert({ where:{ role_id: row.role_id }, update: row, create: row }); },
          async get(id: string){ return prisma.role.findUnique({ where:{ role_id: id } }); },
          async all(){ return prisma.role.findMany(); }
        };
      }
    } catch {}
    // fallback file
    const repo = selectRepo<RoleRow>('roles');
    return {
      async upsert(row: RoleRow){ await repo.upsert(row as any); return row; },
      async get(id: string){ return repo.get(id) as any; },
      async all(){ return repo.all() as any; }
    };
  }
}
