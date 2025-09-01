const __path_mod = await import('path'); const path = __path_mod.default || __path_mod;
const __crypto_mod = await import('crypto'); const crypto = __crypto_mod.default || __crypto_mod;
const __fs_mod = await import('fs'); const fs = __fs_mod.default || __fs_mod;

function id() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

function getDB() {
  try {
    const __Database_mod = await import('better-sqlite3'); const Database = __Database_mod.default || __Database_mod;
    const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'workbuoy.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    const db = new Database(dbPath);
    return db;
  } catch (e) {
    throw new Error('better-sqlite3 is required unless you inject a DB instance via req.app.locals.db');
  }
}

function ensureMigration(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS dsr_requests (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('access','erasure','rectification','consent')),
    user_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','processing','closed','rejected')),
    sla TEXT NOT NULL DEFAULT '30d',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at TEXT,
    evidence TEXT
  );`);
}

function getInjectedDB(req) {
  return (req.app && req.app.locals && req.app.locals.db) ? req.app.locals.db : getDB();
}

function insertRequest(db, rec) {
  const stmt = db.prepare(`INSERT INTO dsr_requests (id, type, user_email, status, sla, created_at, evidence)
                           VALUES (@id, @type, @user_email, @status, @sla, datetime('now'), @evidence)`);
  stmt.run(rec);
}

module.exports = { id, getDB, ensureMigration, getInjectedDB, insertRequest };
