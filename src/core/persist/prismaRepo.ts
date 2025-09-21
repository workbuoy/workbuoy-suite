// src/core/persist/prismaRepo.ts
/* eslint-disable @typescript-eslint/no-var-requires */
type Row = { id: string } & Record<string, any>;

function loadPrismaClient(): any {
  try {
    const mod = require('@prisma/client') as typeof import('@prisma/client');
    return new mod.PrismaClient();
  } catch (error) {
    if (process.env.FF_PERSISTENCE === 'true') {
      throw error;
    }
    const message = 'Prisma client unavailable; install @prisma/client or disable FF_PERSISTENCE.';
    const handler: ProxyHandler<Record<string, unknown>> = {
      get() {
        return () => {
          throw new Error(message);
        };
      },
    };
    return new Proxy({}, handler);
  }
}

export class PrismaRepo<T extends Row> {
  private modelName: string;
  private prisma: any;
  constructor(tableOrModel: string) {
    this.modelName = process.env['PRISMA_MODEL_' + tableOrModel] || tableOrModel;
    this.prisma = loadPrismaClient();
  }
  private model() {
    const m = this.prisma[this.modelName];
    if (!m) throw new Error(`Prisma model not found: ${this.modelName}`);
    return m;
  }
  async all(): Promise<T[]> {
    const rows = await this.model().findMany();
    return rows as T[];
  }
  async get(id: string): Promise<T | undefined> {
    const row = await this.model().findFirst({ where: { id } });
    return row || undefined;
  }
  async upsert(obj: T): Promise<T> {
    await this.model().upsert({ where: { id: obj.id }, update: obj, create: obj });
    return obj;
  }
  async remove(id: string): Promise<boolean> {
    const r = await this.model().deleteMany({ where: { id } });
    return (r?.count || 0) > 0;
  }
}
