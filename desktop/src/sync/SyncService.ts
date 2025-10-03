import crypto from 'crypto';
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';
import { createRequire } from 'module';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdirSync } from 'fs';

const require = createRequire(import.meta.url);

let electronApp: { getPath: (name: string) => string };
let ElectronNotification: new (options: { title: string; body: string }) => { show: () => void };

try {
  const electron = require('electron');
  electronApp = electron.app;
  ElectronNotification = electron.Notification;
} catch {
  electronApp = {
    getPath: () => join(tmpdir(), 'workbuoy-desktop'),
  };
  ElectronNotification = class {
    constructor(private opts: { title: string; body: string }) {}
    show() {
      if (process.env.DEBUG_DESKTOP_NOTIFICATIONS === '1') {
        console.warn(`[notification] ${this.opts.title}: ${this.opts.body}`);
      }
    }
  };
}

export class SyncService {
  private db: sqlite3.Database;
  private key: Buffer;
  private online = false;

  constructor(passphrase: string) {
    const salt = Buffer.from('workbuoy-sync');
    this.key = crypto.pbkdf2Sync(passphrase, salt, 100_000, 32, 'sha256');
    const userDataPath = electronApp.getPath('userData');
    try { mkdirSync(userDataPath, { recursive: true }); } catch {}
    this.db = new sqlite3.Database(`${userDataPath}/cache.db`);
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

  async enqueueOp(entity: string, obj: Record<string, unknown>) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const payload = Buffer.concat([cipher.update(JSON.stringify(obj)), cipher.final()]);
    const tag = cipher.getAuthTag();
    const blob = Buffer.concat([iv, tag, payload]);
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `INSERT INTO pending_ops (entity, data, ts) VALUES (?,?,?)`,
        [entity, blob, Date.now()],
        (err) => (err ? reject(err) : resolve()),
      );
    });
  }

  async syncNow() {
    this.online = true;
    await new Promise<void>((resolve) => {
      this.db.each(
        `SELECT id, entity, data FROM pending_ops ORDER BY id ASC`,
        async (_err, row: { id: number; entity: string; data: Buffer }) => {
          const buf = row.data;
          const iv = buf.subarray(0, 12);
          const tag = buf.subarray(12, 28);
          const payload = buf.subarray(28);
          const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
          decipher.setAuthTag(tag);
          const plain = Buffer.concat([decipher.update(payload), decipher.final()]);
          const obj = JSON.parse(plain.toString());
          try {
            const res = await fetch(`${process.env.SAAS_URL ?? 'http://localhost:3000'}/api/v1/crm/${row.entity}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY_DEV ?? 'dev-123',
              },
              body: JSON.stringify(obj),
            } as any);
            if (res.ok) {
              this.db.run(`DELETE FROM pending_ops WHERE id=?`, [row.id]);
            } else {
              new ElectronNotification({ title: 'Sync error', body: `Failed to sync ${row.entity}` }).show();
            }
          } catch (error) {
            new ElectronNotification({ title: 'Sync offline', body: `Network error: ${error}` }).show();
          }
        },
        () => resolve(),
      );
    });
  }

  status() {
    return { online: this.online, lastSync: new Date().toISOString() };
  }

  getStatus() {
    return this.status();
  }
}
