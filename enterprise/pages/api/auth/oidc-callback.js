
import { Issuer } from 'openid-client';
import { auditLog } from '../../../lib/audit.js';
import jwt from 'jsonwebtoken';
import { rateLimit } from '../../../lib/rate-limit.js';

let _client=null;
async function client(){
  if(_client) return _client;
  const issuer = await Issuer.discover(process.env.OIDC_ISSUER);
  _client = new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uris: [process.env.OIDC_REDIRECT_URI],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post'
  });
  return _client;
}

export default async function handler(req,res){
  if(!rateLimit(req, res, { key:'oidc-callback', windowMs: 60000, max: 60 })) return;
  const c = await client();
  const params = c.callbackParams(req);
  const expectedState = req.cookies?.oidc_state;
  const expectedNonce = req.cookies?.oidc_nonce;
  const code_verifier = req.cookies?.pkce_verifier;

  try{
    const tokenSet = await c.callback(process.env.OIDC_REDIRECT_URI, params, {
      state: expectedState,
      nonce: expectedNonce,
      code_verifier
    });
    const claims = tokenSet.claims();
    // Strict issuer/audience validation (openid-client already validates; we double-check audience)
    if(!claims.aud || (Array.isArray(claims.aud) ? !claims.aud.includes(process.env.OIDC_CLIENT_ID) : claims.aud !== process.env.OIDC_CLIENT_ID)){
      throw new Error('Invalid audience');
    }
    const appToken = jwt.sign({ sub: claims.sub, email: claims.email, name: claims.name }, process.env.APP_JWT_SECRET||'devsecret', { expiresIn: '8h' });
    auditLog({ action:'auth:oidc:callback', details:{ email: claims.email } });
    res.redirect(`/auth/success?token=${appToken}`);
  }catch(e){
    // Increment abuse metric
    try{ require('../../../lib/metrics').increment('wb_auth_abuse_block_total'); }catch(_){}
    auditLog({ action:'auth:oidc:failed', details:{ error: e.message } });
    res.status(400).json({ error: 'OIDC validation failed' });
  }
}
