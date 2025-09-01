
// lib/crypto/envelope.js
const __crypto_mod = await import('crypto'); const crypto = __crypto_mod.default || __crypto_mod;
const __LRU_mod = await import('lru-cache'); const LRU = __LRU_mod.default || __LRU_mod;
const { wrap, unwrap } = require('./kms');

const ttlMs = parseInt(process.env.KMS_CACHE_TTL_MS || '600000', 10);
const cache = new LRU({ max: 1000, ttl: ttlMs });

function genDEK(){ return crypto.randomBytes(32); } // AES-256-GCM key
function gcmEncrypt(dek, plaintext){
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, ct, tag };
}
function gcmDecrypt(dek, iv, tag, ct){
  const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

async function encryptValue(buf){
  const kid = process.env.KMS_KEY_ID || 'local/dev';
  const dek = genDEK();
  const cek = await wrap(kid, dek);
  const { iv, ct, tag } = gcmEncrypt(dek, Buffer.isBuffer(buf) ? buf : Buffer.from(String(buf)));
  cache.set(cek.toString('base64'), dek);
  return {
    alg: 'AES-256-GCM',
    kid,
    cek: cek.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ct: ct.toString('base64')
  };
}

async function decryptValue(obj){
  const key = obj.cek;
  let dek = cache.get(key);
  if(!dek){
    dek = await unwrap(obj.kid, Buffer.from(obj.cek,'base64'));
    cache.set(key, dek);
  }
  const pt = gcmDecrypt(dek, Buffer.from(obj.iv,'base64'), Buffer.from(obj.tag,'base64'), Buffer.from(obj.ct,'base64'));
  return pt;
}

module.exports = { encryptValue, decryptValue };
