
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Optional DB module pattern (lazy)
let db = null;
try {
  const mod = await import('./db/index.js').catch(()=>null);
  db = mod && (mod.default || mod);
} catch { /* noop */ }

const AUDIT_FILE = process.env.WB_AUDIT_FILE || path.join(process.cwd(), 'audit.log');

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

async function getLastHash() {
  if (db && db.getLastAuditHash) {
    return await db.getLastAuditHash();
  }
  // file fallback
  try {
    const txt = fs.readFileSync(AUDIT_FILE, 'utf-8').trim().split('\n');
    if (!txt.length) return null;
    const last = txt[txt.length-1];
    const obj = JSON.parse(last);
    return obj.hash || null;
  } catch { return null; }
}

export async function auditLog(event) {
  const ts = new Date().toISOString();
  const prev_hash = (await getLastHash()) || null;
  const body = JSON.stringify({ ts, prev_hash, event });
  const hash = sha256(body);
  const rec = { ts, prev_hash, hash, event };

  // Try DB first
  if (db && db.insertAuditRecord) {
    try {
      await db.insertAuditRecord(rec);
      return rec;
    } catch { /* fall back to file */ }
  }
  fs.appendFileSync(AUDIT_FILE, JSON.stringify(rec) + '\n');
  return rec;
}

export async function verifyAuditChain(limit=10000) {
  // Prefer DB
  let rows = null;
  if (db && db.readAuditRecords) {
    rows = await db.readAuditRecords(limit);
  } else {
    try {
      const lines = fs.readFileSync(AUDIT_FILE, 'utf-8').trim().split('\n');
      rows = lines.filter(Boolean).map(l=>JSON.parse(l));
    } catch { rows = []; }
  }
  let prev = null;
  for (const r of rows) {
    const body = JSON.stringify({ ts: r.ts, prev_hash: r.prev_hash, event: r.event });
    const recomputed = sha256(body);
    if (r.hash !== recomputed) return { ok:false, error:'hash_mismatch' };
    if (r.prev_hash !== (prev ? prev.hash : null)) return { ok:false, error:'chain_break' };
    prev = r;
  }
  return { ok:true, count: rows.length };
}
