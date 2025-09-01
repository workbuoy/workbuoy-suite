import Stripe from 'stripe'; import { resolveTenantId } from '../../../lib/middleware/tenant.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2024-06-20' });
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const { plan='Solo Pro' } = req.body||{}; const tenant_id = resolveTenantId(req);
  try{
    const priceCents = plan==='Solo Pro'?9900:plan==='Team'?29900:49900;
    const session = await stripe.checkout.sessions.create({ mode:'subscription', line_items:[{ price_data:{ currency:'nok', product_data:{name: plan}, recurring:{interval:'month'} }, quantity:1, amount: priceCents }], success_url:`${req.headers.origin}/portal/billing?success=1`, cancel_url:`${req.headers.origin}/portal/billing?canceled=1`, metadata:{ tenant_id:tenant_id||'enterprise', plan } });
    res.json({ url: session.url });
  }catch(e){ console.error(e); res.status(500).json({error:'stripe_error'}); }
}
