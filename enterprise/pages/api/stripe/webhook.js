import Stripe from 'stripe';
import sqlite3 from 'sqlite3';
import path from 'path';
import { recordBillingEvent, recordStripeWebhookFail } from '../../../lib/metrics/registry.js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'method_not_allowed'});
  const raw = await buffer(req);
  const sig = req.headers['stripe-signature'] || '';

  let event;
  try{
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if(!secret) throw new Error('missing_webhook_secret');
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  }catch(e){
    recordStripeWebhookFail(e.message || 'verify_failed');
    return res.status(400).json({ error: 'signature_verification_failed' });
  }

  const db = new sqlite3.Database(DB_PATH);
  // Idempotence
  const id = event.id;
  const seen = await new Promise((resolve)=> db.get(`SELECT id FROM stripe_events WHERE id=?`,[id], (e,row)=> resolve(!!row)));
  if(seen){ db.close(); return res.status(200).json({ ok:true, idempotent:true }); }
  await new Promise((r)=> db.run(`INSERT INTO stripe_events(id) VALUES(?)`, [id], ()=>r()));

  try{
    switch(event.type){
      case 'checkout.session.completed':{
        const s = event.data.object;
        const tenant_id = (s.metadata && s.metadata.tenant_id) || '';
        const plan = s.metadata?.plan || s.display_items?.[0]?.plan?.nickname || 'Solo Pro';
        await new Promise(r=> db.run(`INSERT INTO subscriptions(tenant_id,user_email,module,plan,status,current_period_end) VALUES(?,?,?,?,?,?)`,
          [tenant_id, s.customer_email||'', 'core', plan, 'active', null], ()=>r()));
        recordBillingEvent(tenant_id, 'purchase');
        break;
      }
      case 'invoice.payment_succeeded':{
        const inv = event.data.object;
        const tenant_id = inv.metadata?.tenant_id || '';
        await new Promise(r=> db.run(`UPDATE subscriptions SET status='active' WHERE tenant_id=?`, [tenant_id], ()=>r()));
        recordBillingEvent(tenant_id, 'renewal');
        break;
      }
      case 'customer.subscription.updated':{
        const sub = event.data.object;
        const tenant_id = sub.metadata?.tenant_id || '';
        const status = sub.status || 'active';
        const plan = sub.items?.data?.[0]?.price?.nickname || null;
        await new Promise(r=> db.run(`UPDATE subscriptions SET status=?, plan=? WHERE tenant_id=?`, [status, plan, tenant_id], ()=>r()));
        if(sub.cancel_at_period_end){ recordBillingEvent(tenant_id, 'cancel_scheduled'); }
        break;
      }
      case 'customer.subscription.deleted':{
        const sub = event.data.object;
        const tenant_id = sub.metadata?.tenant_id || '';
        await new Promise(r=> db.run(`UPDATE subscriptions SET status='canceled' WHERE tenant_id=?`, [tenant_id], ()=>r()));
        recordBillingEvent(tenant_id,'cancel');
        break;
      }
      default:
        // ignore
        break;
    }
    db.close();
    res.status(200).json({ ok:true });
  }catch(e){
    db.close();
    recordStripeWebhookFail('handler_error');
    res.status(500).json({ error:'webhook_error' });
  }
}
