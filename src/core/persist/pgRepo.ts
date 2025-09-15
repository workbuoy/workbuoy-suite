// src/core/persist/pgRepo.ts
// Optional Postgres adapter; only used if USE_PG=1 and PG_URL is set.
// Falls back to no-op if 'pg' is not installed or PG_URL missing.
type Row = { id: string } & Record<string, any>;

export class PgRepo<T extends Row> {
  private url: string | undefined;
  private table: string;
  private pg: any | null = null;

  constructor(table: string) {
    this.url = process.env.PG_URL;
    this.table = table;
    try { this.pg = require('pg'); } catch { this.pg = null; }
  }

  private ensure(): void {
    if (!process.env.USE_PG) throw new Error('USE_PG not set');
    if (!this.url) throw new Error('PG_URL missing');
    if (!this.pg) throw new Error('pg module not installed');
  }

  private async client() {
    this.ensure();
    const { Client } = this.pg;
    const c = new Client({ connectionString: this.url });
    await c.connect();
    return c;
  }

  async all(): Promise<T[]> {
    const c = await this.client();
    try {
      const r = await c.query(`SELECT data FROM ${this.table}`);
      return r.rows.map((x: any) => x.data as T);
    } finally { await c.end(); }
  }

  async get(id: string): Promise<T | undefined> {
    const c = await this.client();
    try {
      const r = await c.query(`SELECT data FROM ${this.table} WHERE (data->>'id') = $1 LIMIT 1`, [id]);
      return r.rows[0]?.data as T | undefined;
    } finally { await c.end(); }
  }

  async upsert(obj: T): Promise<T> {
    const c = await this.client();
    try {
      await c.query(
        `INSERT INTO ${this.table}(data) VALUES ($1)
         ON CONFLICT ((data->>'id')) DO UPDATE SET data = EXCLUDED.data`,
        [obj]
      );
      return obj;
    } finally { await c.end(); }
  }

  async remove(id: string): Promise<boolean> {
    const c = await this.client();
    try {
      const r = await c.query(`DELETE FROM ${this.table} WHERE (data->>'id') = $1`, [id]);
      return r.rowCount > 0;
    } finally { await c.end(); }
  }
}

// Helper to pick repo by env
export function selectRepo<T extends Row>(table: string) {
  if (process.env.USE_PG === '1') {
    return new PgRepo<T>(table);
  } else {
    const { FileRepo } = require('./fileRepo');
    return new FileRepo<T>(`${table}.json`);
  }
}
