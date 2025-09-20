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
    return new PgRepo(tableOrModel) as Repo<T>;
  }
  if (mode === 'prisma') {
    const { PrismaRepo } = require('./prismaRepo');
    return new PrismaRepo(tableOrModel) as Repo<T>;
  }
  const { FileRepo } = require('./fileRepo');
  return new FileRepo(`${tableOrModel}.json`) as Repo<T>;
}
