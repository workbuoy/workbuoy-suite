import Stripe from 'stripe';
import sqlite3 from 'sqlite3';
import path from 'path';
import { funnel } from '../metrics.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2024-06-20' });
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const { plan='individual', module='core', trialDays=7, successUrl, cancelUrl } = req.body||{};
  const prices = { individual: 900, team: 2900, business: 4900 };
  try{
    const session = await stripe.checkout.sessions.create({
      mode:'subscription',
      payment_method_types:['card'],
      line_items:[{ price_data:{ currency:'usd', recurring:{interval:'month'}, unit_amount:prices[plan]||900, product_data:{ name:`WorkBuoy Core – ${plan}` } }, quantity:1 }],
      subscription_data: trialDays ? { trial_period_days: trialDays } : {},
      success_url: successUrl || `${req.headers.origin}/app/core/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/pricing.html`
    });
    // record trial start
    const db = new sqlite3.Database(DB_PATH);
    db.run(`CREATE TABLE IF NOT EXISTS subscriptions(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT, module TEXT, plan TEXT, status TEXT, current_period_end TEXT, trial_end TEXT
    )`);
    db.run(`INSERT INTO subscriptions(user_email,module,plan,status) VALUES(?,?,?,?)`, ['', module, plan, 'trialing']);
    funnel('trial_started', { module, plan });
    res.json({ id: session.id, url: session.url });
  }catch(e){
    console.error(e);
    res.status(500).json({error:'stripe_error'});
  }
}