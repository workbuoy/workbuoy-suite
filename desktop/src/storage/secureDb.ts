import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { join } from 'path';

type PendingOp = {
  id: string;
  entity_type: string;
  op: 'create' | 'update' | 'delete';
  payload_b64: string;
  ts: number;
};

type CachedEntityRow = {
  id: string;
  entity_type: string;
  payload_b64: string;
  updated_at: number;
};

export class SecureDb {
  private db: any;
  private passphrase?: string;

  constructor(private dir: string, passphrase?: string) {
    this.passphrase = passphrase;
    mkdirSync(dir, { recursive: true });
    this.db = new Database(join(dir, 'workbuoy.enc.sqlite'));
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS cached_entities (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        payload_b64 TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pending_ops (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        op TEXT NOT NULL,
        payload_b64 TEXT NOT NULL,
        ts INTEGER NOT NULL
      );
    `);
  }

  private enc(obj: unknown) {
    return Buffer.from(JSON.stringify(obj)).toString('base64');
  }

  private dec<T>(b64: string): T {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8')) as T;
  }

  enqueueOp(id: string, entityType: string, op: 'create' | 'update' | 'delete', payload: unknown, ts: number) {
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO pending_ops (id, entity_type, op, payload_b64, ts) VALUES (@id,@t,@o,@p,@ts)`,
    );
    stmt.run({ id, t: entityType, o: op, p: this.enc(payload), ts });
  }

  popNextOps(batch = 200) {
    const rows = this.db.prepare(`SELECT * FROM pending_ops ORDER BY ts ASC LIMIT ?`).all(batch) as PendingOp[];
    const deleter = this.db.prepare(`DELETE FROM pending_ops WHERE id=?`);
    return {
      rows,
      ack: (ids: string[]) => {
        const trx = this.db.transaction((targets: string[]) => targets.forEach((id) => deleter.run(id)));
        trx(ids);
      },
    };
  }

  countPending() {
    const r = this.db.prepare(`SELECT COUNT(*) as c FROM pending_ops`).get() as { c?: number } | undefined;
    return r?.c ?? 0;
  }

  putCache(id: string, entityType: string, payload: unknown, updatedAt: number) {
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO cached_entities (id, entity_type, payload_b64, updated_at) VALUES (@id,@t,@p,@ts)`,
    );
    stmt.run({ id, t: entityType, p: this.enc(payload), ts: updatedAt });
  }

  getCache<T extends Record<string, unknown> = Record<string, unknown>>(id: string) {
    const row = this.db.prepare(`SELECT * FROM cached_entities WHERE id=?`).get(id) as CachedEntityRow | undefined;
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      entity: row.entity_type,
      payload: this.dec<T>(row.payload_b64),
      updated_at: row.updated_at,
    };
  }

  listCache<T extends Record<string, unknown> = Record<string, unknown>>(entityType: string, limit = 50) {
    const rows = this.db
      .prepare(`SELECT * FROM cached_entities WHERE entity_type=? ORDER BY updated_at DESC LIMIT ?`)
      .all(entityType, limit) as CachedEntityRow[];
    return rows.map((row) => ({
      id: row.id,
      payload: this.dec<T>(row.payload_b64),
      updated_at: row.updated_at,
    }));
  }

  rotatePassphrase(next?: string) {
    this.passphrase = next ?? this.passphrase;
  }
}
