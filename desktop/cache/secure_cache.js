import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAGIC = Buffer.from('WB1_');
const ALG = 'aes-256-gcm';

function loadKey(){
  const env = process.env.WB_SECRETS_KEY;
  if (env) return crypto.scryptSync(env, 'workbuoy-desktop-env', 32);
  // fallback static test key (only for CI/mocks)
  return crypto.createHash('sha256').update('workbuoy-test-key').digest();
}

export class SecureCache {
  constructor(cachePath) {
    this.cachePath = cachePath || path.join(process.cwd(), '.wb_cache.enc');
    this.key = loadKey();
  }
  loadQueue() {
    if (!fs.existsSync(this.cachePath)) return [];
    const b64 = fs.readFileSync(this.cachePath, 'utf8').trim();
    const buf = Buffer.from(b64, 'base64');
    const iv = buf.slice(MAGIC.length, MAGIC.length+12);
    const tag = buf.slice(buf.length-16);
    const ct = buf.slice(MAGIC.length+12, buf.length-16);
    const decipher = crypto.createDecipheriv(ALG, this.key, iv); decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    return JSON.parse(pt.toString('utf8'));
  }
  saveQueue(arr) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALG, this.key, iv);
    const pt = Buffer.from(JSON.stringify(arr), 'utf8');
    const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
    const tag = cipher.getAuthTag();
    const out = Buffer.concat([MAGIC, iv, ct, tag]).toString('base64');
    fs.writeFileSync(this.cachePath, out);
  }
  append(item){ const q = this.loadQueue(); q.push(item); this.saveQueue(q); return q.length; }
  drain(processor){
    const q = this.loadQueue(); const remaining=[];
    for (const it of q){ try{ processor(it); }catch{ remaining.push(it);} }
    this.saveQueue(remaining); return { before:q.length, after:remaining.length };
  }
}
