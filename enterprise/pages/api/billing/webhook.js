import Stripe from 'stripe';
import { Pool } from 'pg';

export const config = { api: { bodyParser: false } };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res){
  if (req.method !== 'POST'){
    res.setHeader('Allow', 'POST'); 
    return res.status(405).end('Method Not Allowed');
  }
  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err){
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const idempotencyKey = event.id;
  try {
    await pool.query('BEGIN');
    const exists = await pool.query('SELECT 1 FROM idempotency_keys WHERE key=$1', [idempotencyKey]);
    if (exists.rowCount > 0){
      await pool.query('ROLLBACK');
      return res.status(200).json({ received: true, dedup: true });
    }
    // Handle event types here (customer.subscription.updated, invoice.paid, etc.)
    // ... domain logic ...

    await pool.query('INSERT INTO idempotency_keys (key) VALUES ($1)', [idempotencyKey]);
    await pool.query('COMMIT');
  } catch (e){
    await pool.query('ROLLBACK');
    console.error('[stripe-webhook]', e);
    return res.status(500).json({ ok: false });
  }
  res.json({ received: true });
}
