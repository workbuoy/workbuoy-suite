import { requireAuth } from '../../../lib/middleware/require-auth.js';
import { withRateLimit } from '../../../lib/middleware/rate-limit.js';

import Stripe from 'stripe'; import { wbBillingCheckout } from '../../../lib/metrics/registry.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY||'', { apiVersion:'2024-06-20' });
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  try{
    const { priceId=process.env.STRIPE_PRICE_SOLO, success_url='/portal/billing?success=1', cancel_url='/portal/billing?canceled=1' } = req.body||{};
    const session = await stripe.checkout.sessions.create({ mode:'subscription', line_items:[{ price: priceId, quantity:1 }], success_url, cancel_url });
    try{ wbBillingCheckout.inc(); }catch(_){}
    res.json({ url: session.url });
  }catch(e){
    res.status(500).json({error:'stripe_create_failed'});
  }
}
