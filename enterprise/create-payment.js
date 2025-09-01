import Stripe from 'stripe';
import sqlite3 from 'sqlite3';
import path from 'path';
import { funnel } from '../metrics.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2024-06-20' });
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const { amount=2500, taskType='temp' } = req.body||{};
  try{
    const session = await stripe.checkout.sessions.create({
      mode:'payment',
      payment_method_types:['card'],
      line_items:[{ price_data:{ currency:'usd', unit_amount: Math.round(Number(amount)*100) ? Math.round(Number(amount)*100) : amount*100, product_data:{ name:`WorkBuoy Flex – ${taskType}` } }, quantity:1 }],
      success_url: `${req.headers.origin}/app/flex/task/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing.html`
    });
    // record flex job intent
    const db = new sqlite3.Database(DB_PATH);
    db.run(`CREATE TABLE IF NOT EXISTS flex_jobs(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT, user_email TEXT, type TEXT, amount_cents INTEGER, status TEXT, created_ts TEXT DEFAULT (datetime('now'))
    )`);
    db.run(`INSERT INTO flex_jobs(task_id,type,amount_cents,status) VALUES(?,?,?,?)`, [session.id, taskType, Number(amount)*100, 'payment_intent_created']);
    funnel('flex_paid', { type: taskType });
    res.json({ id: session.id, url: session.url });
  }catch(e){
    console.error(e);
    res.status(500).json({error:'stripe_error'});
  }
}