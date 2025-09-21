import { selectRepo } from '../../core/persist/select';

export type FeatureRow = {
  id: string;
  title?: string;
  description?: string;
  default_autonomy_cap?: number;
  capabilities?: string[];
};

export class FeatureRepoV2 {
  static async open(){
    try {
      if (process.env.FF_PERSISTENCE === 'true') {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        return {
          async upsert(row: FeatureRow){ return prisma.feature.upsert({ where:{ id: row.id }, update: row, create: row }); },
          async get(id: string){ return prisma.feature.findUnique({ where:{ id } }); },
          async all(){ return prisma.feature.findMany(); }
        };
      }
    } catch {}
    const repo = selectRepo<FeatureRow>('features');
    return {
      async upsert(row: FeatureRow){ await repo.upsert(row as any); return row; },
      async get(id: string){ return repo.get(id) as any; },
      async all(){ return repo.all() as any; }
    };
  }
}
