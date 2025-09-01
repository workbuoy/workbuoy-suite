
'use strict';
const PII_FIELDS = new Set(['email','phone','firstName','lastName','address']);
function mask(value, strategy='partial'){
  if(value==null) return value;
  const s = String(value);
  if(strategy==='full') return '*'.repeat(Math.min(8,s.length));
  if(strategy==='hash') return require('crypto').createHash('sha256').update(s).digest('hex').slice(0,16);
  // partial
  if(s.includes('@')){ const [u, d] = s.split('@'); return (u.slice(0,1)+'***')+'@'+d; }
  return s.slice(0,2)+'***';
}
function isPII(field){ return PII_FIELDS.has(field); }
module.exports = { mask, isPII };
