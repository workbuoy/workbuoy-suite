import fs from 'fs';
import path from 'path';
import { brandFor } from './branding.js';
import { has, grant, list, userKey } from './entitlement.js';

const TPL_DIR = path.join(process.cwd(),'templates','kits');

export function templatePath(kind){
  const m = { sales: 'sales.md', excel:'excel.json', powerpoint:'powerpoint.json', custom:'custom.md' };
  return path.join(TPL_DIR, m[kind] || m.custom);
}

export function generate(kind, moduleType='core', context={}){
  const b = brandFor(moduleType);
  const file = templatePath(kind);
  const raw = fs.readFileSync(file,'utf8');
  const rendered = raw.replace(/{{\s*brand\s*}}/g, b.name)
                      .replace(/{{\s*pricing\s*}}/g, b.pricing)
                      .replace(/{{\s*badge\s*}}/g, b.badge)
                      .replace(/{{\s*timestamp\s*}}/g, new Date().toISOString())
                      .replace(/{{\s*(\w+)\s*}}/g, (_,k)=> (context[k] ?? ''));
  return { kind, moduleType, brand: b, content: rendered };
}

export function ensureEntitled(req, sku){
  const u = userKey(req);
  if(!has(u, sku)) throw Object.assign(new Error('Kit not entitled'), { status: 403 });
  return true;
}

export function entitlementGrant(req, sku){
  const u = userKey(req);
  return grant(u, sku);
}

export function listEntitlements(req){
  const u = userKey(req);
  return list(u);
}