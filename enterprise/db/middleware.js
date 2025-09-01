
// lib/db/middleware.js
// Wraps a db client to encrypt configured PII fields on write and decrypt (or mask) on read.
const __fs_mod = await import('fs'); const fs = __fs_mod.default || __fs_mod;
const __path_mod = await import('path'); const path = __path_mod.default || __path_mod;
const { encryptValue, decryptValue } = require('../crypto/envelope');
const { maskPII } = require('../pii');

function loadMap(){
  try{
    const p = path.join(process.cwd(),'public','config','pii.fields.json');
    return JSON.parse(fs.readFileSync(p,'utf8'));
  }catch(e){ return { tables: {} }; }
}

function isPII(table, col){
  const map = loadMap();
  return (map.tables[table] || []).includes(col);
}

async function maybeEncrypt(table, row){
  const out = { ...row };
  for(const [k,v] of Object.entries(row)){
    if(isPII(table, k) && v != null){
      out[k] = JSON.stringify(await encryptValue(String(v)));
    }
  }
  return out;
}

async function maybeDecryptRow(table, row, options = {}){
  const policy = options.policy || { masking:false };
  const out = { ...row };
  for(const [k,v] of Object.entries(row)){
    if(isPII(table,k) && v){
      try{
        const obj = typeof v === 'string' ? JSON.parse(v) : v;
        const pt = await decryptValue(obj);
        out[k] = policy.masking ? maskPII(pt.toString('utf8')) : pt.toString('utf8');
      }catch(_e){
        // leave as-is if not decryptable
      }
    }
  }
  return out;
}

module.exports = { maybeEncrypt, maybeDecryptRow };
