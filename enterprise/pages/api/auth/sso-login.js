
import { randomBytes } from 'crypto';
import sso from '../../../config/sso.json' assert { type:'json' };

export default async function handler(req,res){
  const providerId = String(req.query.provider||'azuread');
  const p = sso.providers.find(x=>x.id===providerId);
  if(!p) return res.status(400).json({error:'unknown_provider'});
  const state = randomBytes(16).toString('hex');
  const nonce = randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', [`oidc_state=${state}; HttpOnly; Path=/; SameSite=Lax`, `oidc_nonce=${nonce}; HttpOnly; Path=/; SameSite=Lax`]);
  const authUrl = new URL(p.issuer.replace(/\/$/,'') + '/authorize');
  authUrl.searchParams.set('client_id', p.client_id);
  authUrl.searchParams.set('redirect_uri', p.redirect_uri);
  authUrl.searchParams.set('response_type','code');
  authUrl.searchParams.set('scope','openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  res.redirect(authUrl.toString());
}
