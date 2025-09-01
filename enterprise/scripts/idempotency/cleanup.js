import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const db = new sqlite3.Database(DB_PATH);
const now = Date.now()/1000;
db.run(`DELETE FROM idempotency_keys WHERE strftime('%s',created_at) + ttl_seconds < ?`, [now], ()=> process.exit(0));
