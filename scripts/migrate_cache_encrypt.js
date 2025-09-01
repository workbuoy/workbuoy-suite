#!/usr/bin/env node
import { SecureCache } from '../desktop/cache/secure_cache.js';

const sc = new SecureCache();
try {
  const q = sc.loadQueue(); // this performs migration if needed
  sc.saveQueue(q); // ensure encrypted exists
  console.log(JSON.stringify({ migrated:true, pending:q.length }));
} catch (e) {
  console.error('Migration failed:', e.message);
  process.exit(1);
}
