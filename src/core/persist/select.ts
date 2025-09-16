// src/core/persist/select.ts
type Row = { id: string } & Record<string, any>;

export interface Repo<T extends Row> {
  all(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  upsert(obj: T): Promise<T>;
  remove(id: string): Promise<boolean>;
}

export function selectRepo<T extends Row>(tableOrModel: string): Repo<T> {
  const mode = (process.env.PERSIST_MODE || 'file').toLowerCase();
  if (mode === 'pg') {
    const { PgRepo } = require('./pgRepo');
    return new PgRepo<T>(tableOrModel);
  }
  if (mode === 'prisma') {
    const { PrismaRepo } = require('./prismaRepo');
    return new PrismaRepo<T>(tableOrModel);
  }
  const { FileRepo } = require('./fileRepo');
  return new FileRepo<T>(`${tableOrModel}.json`);
}
