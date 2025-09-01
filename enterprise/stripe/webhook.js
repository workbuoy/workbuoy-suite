import Stripe from 'stripe';
import sqlite3 from 'sqlite3';
import path from 'path';
import { funnel } from '../../metrics.js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2024-06-20' });
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', (err) => reject(err));
  });
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const sig = req.headers['stripe-signature'] || '';
  const raw = await buffer(req);
  let event;
  try{
    if(process.env.NODE_ENV==='test'){
      event = JSON.parse(raw.toString('utf8'));
    }else{
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    }
  }catch(e){
    console.error('webhook signature error', e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  const db = new sqlite3.Database(DB_PATH);
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT, module TEXT, plan TEXT, status TEXT, current_period_end TEXT, trial_end TEXT
  )`);
  try{
    switch(event.type){
      case 'checkout.session.completed':{
        const s = event.data.object;
        if(s.mode==='subscription'){
          // mark trial started / subscription created
          db.run(`INSERT INTO subscriptions(user_email,module,plan,status,trial_end) VALUES(?,?,?,?,?)`,
            [s.customer_email||'', 'core', 'individual', s.subscription ? 'active' : 'trialing', null]);
          funnel('trial_started', { module:'core', plan:'individual' });
        }else if(s.mode==='payment'){
          db.run(`INSERT INTO flex_jobs(task_id,type,amount_cents,status) VALUES(?,?,?,?)`,
            [s.id, 'temp', s.amount_total||0, 'paid']);
          funnel('flex_paid', { type:'temp' });
        }
        break;
      }
      case 'customer.subscription.created':{
        const sub = event.data.object;
        db.run(`INSERT INTO subscriptions(user_email,module,plan,status,trial_end,current_period_end) VALUES(?,?,?,?,?,?)`,
          ['', 'core', 'individual', sub.status, sub.trial_end? new Date(sub.trial_end*1000).toISOString(): null, new Date(sub.current_period_end*1000).toISOString()]);
        funnel('trial_started', { module:'core', plan:'individual' });
        break;
      }
      case 'customer.subscription.updated':{
        const sub = event.data.object;
        if(sub.status==='active'){ funnel('trial_converted', { module:'core', plan:'individual' }); }
        if(sub.status==='canceled'){ funnel('trial_expired', { module:'core', plan:'individual' }); }
        break;
      }
      default: break;
    }
  }finally{
    db.close();
  }
  res.json({ received: true });
}
