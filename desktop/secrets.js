const crypto = require('node:crypto');

function getKey() {
  const k = process.env.WB_SECRETS_KEY || '';
  if (!k) return null;
  return crypto.createHash('sha256').update(k).digest().subarray(0,32);
}

function encrypt(buf) {
  const key = getKey(); if (!key) return { iv:null, data: buf };
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const out = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('base64'), tag: tag.toString('base64'), data: out.toString('base64') };
}

function decrypt(obj) {
  const key = getKey(); if (!key || !obj?.iv) return Buffer.from(obj?.data||'', 'base64');
  const iv = Buffer.from(obj.iv, 'base64');
  const tag = Buffer.from(obj.tag, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(Buffer.from(obj.data,'base64')), decipher.final()]);
  return out;
}

module.exports = { encrypt, decrypt };
