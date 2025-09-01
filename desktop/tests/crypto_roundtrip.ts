import { mkdirSync, rmSync } from 'fs';
import path from 'path';
import { SecureDb } from '../src/storage/secureDb.js';

(async () => {
  const dir = path.join(process.cwd(), '.wb_crypto');
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  mkdirSync(dir, { recursive: true });

  const pass = 'secret-pass-1';
  const db = new SecureDb(dir, pass);
  db.putCache('c1', 'contact', { id: 'c1', name: 'Alice', updated_at: Date.now() }, Date.now());
  const read = db.getCache('c1');
  if (!read || read.payload.name !== 'Alice') { console.error('Roundtrip failed'); process.exit(1); }

  // rotate
  db.rotatePassphrase('secret-pass-2');
  const db2 = new SecureDb(dir, 'secret-pass-2');
  const read2 = db2.getCache('c1');
  if (!read2 || read2.payload.name !== 'Alice') { console.error('Rotate failed'); process.exit(1); }

  console.log('CRYPTO PASS');
  process.exit(0);
})();
