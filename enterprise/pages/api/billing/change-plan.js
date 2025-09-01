import Stripe from 'stripe'; import path from 'path'; import sqlite3 from 'sqlite3';
import { recordBillingEvent } from '../../../lib/metrics/registry.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion:'2024-06-20' });
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const auth = req.headers.authorization || ''; const m = auth.match(/^Bearer\s+(.+)$/i); if(!m) return res.status(401).json({error:'missing_token'});
  const payload = require('../../../lib/auth.js').verifyToken(m[1]); if(!payload) return res.status(401).json({error:'invalid_token'});
  const { plan } = req.body||{}; if(!plan) return res.status(400).json({error:'missing_plan'});
  const tenant_id = payload.tenant_id;

  const db = new sqlite3.Database(DB_PATH);
  await new Promise(r=> db.run(`UPDATE subscriptions SET plan=? WHERE tenant_id=?`, [plan, tenant_id], ()=>r()));
  recordBillingEvent(tenant_id, 'upgrade');
  db.close();
  res.json({ ok:true });
}
