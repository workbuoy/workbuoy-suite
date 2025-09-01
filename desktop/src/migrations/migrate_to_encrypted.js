// migrate_to_encrypted.js - convert existing plaintext DB to SQLCipher-encrypted (best-effort)
const fs = require('fs');
const path = require('path');
const { openEncryptedDb } = require('../crypto/secureStorage');

async function migrate(dbPath) {
  const bak = dbPath + '.precrypt.bak';
  if (!fs.existsSync(dbPath)) {
    console.log('[migrate] no db at', dbPath);
    return true;
  }
  // copy current DB as backup
  fs.copyFileSync(dbPath, bak);
  // open target encrypted (this will just be "keyed" if SQLCipher is active)
  const enc = await openEncryptedDb(dbPath);
  try {
    // probe a read to ensure key works
    enc.prepare("PRAGMA user_version").get();
    console.log('[migrate] encryption pragma applied (if SQLCipher present)');
    return true;
  } catch (e) {
    console.warn('[migrate] encryption not active (likely no SQLCipher build). Continuing with backup kept.', e.message);
    return false;
  } finally {
    try { enc.close(); } catch {}
  }
}

if (require.main === module) {
  const dbPath = process.argv[2] || path.join(process.cwd(), 'workbuoy.sqlite');
  migrate(dbPath).then(ok => {
    console.log('[migrate] done:', ok);
    process.exit(ok?0:1);
  });
}

module.exports = { migrate };
