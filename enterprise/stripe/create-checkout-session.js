import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2024-06-20' });

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'method_not_allowed'});
  const { kit_id='slides-3up', success_url, cancel_url } = req.body || {};
  try{
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: { currency: 'usd', unit_amount: 900, product_data: { name: `WorkBuoy Kit: ${kit_id}` } },
        quantity: 1
      }],
      success_url: success_url || `${req.headers.origin}/kits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.origin}/kits/cancel`
    });
    res.json({ id: session.id, url: session.url });
  }catch(e){
    console.error(e);
    res.status(500).json({error:'stripe_error'});
  }
}
