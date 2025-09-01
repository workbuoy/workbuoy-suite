import Stripe from 'stripe';

  // RBAC admin+ check
  try {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if(!m){ return res.status(401).json({error:'missing_token'}); }
    const payload = require('../../../../lib/auth.js').verifyToken(m[1]);
    if(!payload){ return res.status(401).json({error:'invalid_token'}); }
    const db = new (require('sqlite3').Database)(process.env.DB_PATH || require('path').join(process.cwd(),'db','workbuoy.db'));
    await new Promise((resolve,reject)=> db.get(`SELECT role FROM org_users WHERE tenant_id=? AND user_email=?`, [payload.tenant_id,payload.email], (e,row)=>{ if(e) reject(e); else { if(!row || !['owner','admin'].includes(row.role)) { resolve('deny'); } else resolve(row);} }));
    if (typeof roleCheck !== 'object') { /* deny */ return res.status(403).json({error:'forbidden'}); }
  } catch(_){ return res.status(403).json({error:'forbidden'}); }

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