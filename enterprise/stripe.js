import Stripe from 'stripe';
const secret = process.env.STRIPE_SECRET_KEY || '';
export const stripe = new Stripe(secret || 'sk_test_dummy', { apiVersion: '2024-06-20' });

export function constructWebhookEvent(rawBody, signature){
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if(!endpointSecret){
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
}

export function hasRealSecrets(){
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_'));
}
