import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { join } from 'path';

export class SecureDb {
  db: Database.Database;
  constructor(private dir: string, _opts?: any) {
    mkdirSync(dir, { recursive: true });
    this.db = new Database(join(dir, 'workbuoy.enc.sqlite'));
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS cached_entities (id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, payload_b64 TEXT NOT NULL, updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS pending_ops (id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, op TEXT NOT NULL, payload_b64 TEXT NOT NULL, ts INTEGER NOT NULL);
    `);
  }
  private enc(obj:any){ return Buffer.from(JSON.stringify(obj)).toString('base64'); }
  private dec(b64:string){ return JSON.parse(Buffer.from(b64, 'base64').toString('utf8')); }
  enqueueOp(id: string, entityType: string, op: 'create'|'update'|'delete', payload: any, ts: number) {
    const stmt = this.db.prepare(`INSERT OR REPLACE INTO pending_ops (id, entity_type, op, payload_b64, ts) VALUES (@id,@t,@o,@p,@ts)`);
    stmt.run({ id, t: entityType, o: op, p: this.enc(payload), ts });
  }
  popNextOps(batch=200) {
    const rows = this.db.prepare(`SELECT * FROM pending_ops ORDER BY ts ASC LIMIT ?`).all(batch);
    const del = this.db.prepare(`DELETE FROM pending_ops WHERE id=?`);
    return { rows, ack: (ids: string[]) => { const trx = this.db.transaction((ids:string[]) => ids.forEach(id => del.run(id))); trx(ids); } };
  }
  countPending() {
    const r = this.db.prepare(`SELECT COUNT(*) as c FROM pending_ops`).get();
    return r.c as number;
  }
}
