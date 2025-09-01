import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const plans={ 'Solo Pro':{events_per_day:5000,connectors_max:2,rpm:60,burst:30}, 'Team':{events_per_day:20000,connectors_max:5,rpm:120,burst:60}, 'Business':{events_per_day:100000,connectors_max:15,rpm:240,burst:120} };
const buckets=new Map();
export default function tenantRate(req,res){
  const tenant=(req.headers['x-tenant-id']||req.tenant_id||'enterprise').toString();
  const {rpm,burst}=plans[getPlan(tenant)]||{rpm:120,burst:60};
  const now=Date.now(); const key=`t:${tenant}:${req.headers['x-user-id']||'anon'}`;
  const b=buckets.get(key)||{tokens:burst,last:now}; const el=(now-b.last)/60000; b.tokens=Math.min(burst,b.tokens+el*rpm); b.last=now;
  if(b.tokens<1){ res.setHeader('Retry-After', String(Math.ceil(60/rpm))); res.status(429).json({error:'rate_limited'}); buckets.set(key,b); return true; }
  b.tokens-=1; buckets.set(key,b); return false;
}
function getPlan(tenant){
  try{ const db=new sqlite3.Database(DB_PATH); return require('deasync')(cb=>db.get(`SELECT plan FROM subscriptions WHERE tenant_id=? ORDER BY id DESC LIMIT 1`,[tenant],(e,r)=>cb(null,r?.plan||'Solo Pro'))); }catch(_){ return 'Solo Pro'; }
}


import { recordQuotaViolation } from '../metrics/registry.js';
// Daily events quota enforcement using usage_counters('events')
export async function enforceDailyEventsQuota(req, res, tenant, limit){
  const sqlite3 = require('sqlite3'); const path = require('path');
  const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
  const db = new sqlite3.Database(DB_PATH);
  const day = new Date().toISOString().slice(0,10);
  const count = await new Promise((resolve)=> db.get(`SELECT count FROM usage_counters WHERE tenant_id=? AND counter_name='events' AND day=?`, [tenant, day], (e,row)=> resolve(row?.count||0)));
  db.close();
  if (count >= (limit||0)){
    recordQuotaViolation(tenant, 'events_per_day');
    res.status(429).json({ error: 'for_many_events_today', message: 'Du har nådd dagskvoten for hendelser i din plan.' });
    return true;
  }
  return false;
}
