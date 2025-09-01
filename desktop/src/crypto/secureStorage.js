// secureStorage.js - lightweight SQLCipher integration wrapper for WorkBuoy Desktop
// - Uses better-sqlite3 and PRAGMA key if SQLCipher is available
// - Retrieves key from OS keyring via keytar; falls back to WB_SECRETS_KEY
const os = require('os');
const path = require('path');
const Database = require('better-sqlite3');

let keytar;
try { keytar = require('keytar'); } catch { keytar = null; }

const APP_KEY_SERVICE = 'workbuoy.desktop.db';
const APP_KEY_ACCOUNT = os.userInfo().username || 'default';

async function getDbKey() {
  if (keytar) {
    let key = await keytar.getPassword(APP_KEY_SERVICE, APP_KEY_ACCOUNT);
    if (!key) {
      key = process.env.WB_SECRETS_KEY || null;
      if (!key) throw new Error('WB_SECRETS_KEY not set and keytar empty');
      await keytar.setPassword(APP_KEY_SERVICE, APP_KEY_ACCOUNT, key);
    }
    return key;
  }
  const key = process.env.WB_SECRETS_KEY;
  if (!key) throw new Error('WB_SECRETS_KEY missing (no keytar available)');
  return key;
}

async function openEncryptedDb(dbPath) {
  const db = new Database(dbPath);
  // Try PRAGMA key (works when better-sqlite3 is linked with SQLCipher)
  try {
    const k = await getDbKey();
    db.pragma(`key='${k}'`);
    // optional: set cipher params
    db.pragma("cipher_page_size = 4096");
    db.pragma("kdf_iter = 64000");
  } catch (e) {
    // If PRAGMA key fails, continue unencrypted but mark flag (for telemetry)
    process.env.WB_DB_ENCRYPTION_DISABLED = '1';
  }
  return db;
}

module.exports = { openEncryptedDb, getDbKey };
