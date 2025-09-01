// desktop/src/sync/SyncService.ts
import crypto from 'crypto';
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';
import { app, Notification } from 'electron';

export class SyncService {
  private db: sqlite3.Database;
  private key: Buffer;
  private online: boolean = false;

  constructor(passphrase: string) {
    const salt = Buffer.from('workbuoy-sync');
    this.key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
    this.db = new sqlite3.Database(app.getPath('userData') + '/cache.db');
    this.init();
  }

  private init() {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS pending_ops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity TEXT,
        data BLOB,
        ts INTEGER
      )`);
    });
  }

  public async enqueueOp(entity: string, obj: any) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const payload = Buffer.concat([cipher.update(JSON.stringify(obj)), cipher.final()]);
    const tag = cipher.getAuthTag();
    const blob = Buffer.concat([iv, tag, payload]);
    this.db.run("INSERT INTO pending_ops (entity, data, ts) VALUES (?,?,?)",
      [entity, blob, Date.now()]);
  }

  public async syncNow() {
    this.online = true;
    this.db.each("SELECT id, entity, data FROM pending_ops ORDER BY id ASC", async (err, row) => {
      if (err) return;
      const buf = row.data as Buffer;
      const iv = buf.subarray(0,12);
      const tag = buf.subarray(12,28);
      const payload = buf.subarray(28);
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(tag);
      const plain = Buffer.concat([decipher.update(payload), decipher.final()]);
      const obj = JSON.parse(plain.toString());
      try {
        const res = await fetch(process.env.SAAS_URL + '/api/v1/crm/' + row.entity, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'x-api-key': process.env.API_KEY_DEV||'dev-123' },
          body: JSON.stringify(obj)
        });
        if (res.ok) {
          this.db.run("DELETE FROM pending_ops WHERE id=?", [row.id]);
        } else {
          new Notification({title:'Sync error', body:`Failed to sync ${row.entity}`}).show();
        }
      } catch(e) {
        new Notification({title:'Sync offline', body:`Network error: ${e}`}).show();
      }
    });
  }

  public status() {
    return { online: this.online, lastSync: new Date().toISOString() };
  }
}
