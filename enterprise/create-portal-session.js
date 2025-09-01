import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2024-06-20' });

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const { customerId } = req.body||{};
  try{
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.STRIPE_PORTAL_RETURN_URL || `${req.headers.origin}/settings/billing`
    });
    res.json({ url: session.url });
  }catch(e){
    console.error(e);
    res.status(500).json({error:'stripe_error'});
  }
}