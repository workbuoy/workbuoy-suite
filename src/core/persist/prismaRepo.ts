// src/core/persist/prismaRepo.ts
type Row = { id: string } & Record<string, any>;

export class PrismaRepo<T extends Row> {
  private modelName: string;
  private prisma: any;
  constructor(tableOrModel: string) {
    this.modelName = process.env['PRISMA_MODEL_' + tableOrModel] || tableOrModel;
    const { PrismaClient } = require('@prisma/client');
    this.prisma = new PrismaClient();
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
