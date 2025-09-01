import fs from 'fs';
import path from 'path';

const ENTITLEMENTS_PATH = process.env.WB_ENTITLEMENTS_PATH || path.join(process.cwd(),'db','entitlements.json');

function readStore(){
  try { return JSON.parse(fs.readFileSync(ENTITLEMENTS_PATH,'utf8')); }
  catch(e){ return { users: {} }; }
}
function writeStore(s){ fs.mkdirSync(path.dirname(ENTITLEMENTS_PATH),{recursive:true}); fs.writeFileSync(ENTITLEMENTS_PATH, JSON.stringify(s,null,2)); }

export function userKey(req){
  return req?.headers?.['x-user'] || 'demo';
}

export function grant(user, sku){
  const store = readStore();
  store.users[user] = store.users[user] || { kits: {} };
  store.users[user].kits[sku] = { entitled: true, grantedAt: new Date().toISOString() };
  writeStore(store);
  return store.users[user].kits[sku];
}

export function has(user, sku){
  const store = readStore();
  return !!store.users?.[user]?.kits?.[sku]?.entitled;
}

export function list(user){
  const store = readStore();
  return Object.keys(store.users?.[user]?.kits || {});
}