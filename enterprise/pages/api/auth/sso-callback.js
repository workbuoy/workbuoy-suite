
import sso from '../../../config/sso.json' assert { type:'json' };
import { getJwks } from '../../../lib/auth/jwks-cache.js';
import jwt from 'jsonwebtoken'; import fetch from 'node-fetch';

export default async function handler(req,res){
  const providerId = String(req.query.provider||'azuread');
  const p = sso.providers.find(x=>x.id===providerId);
  if(!p) return res.status(400).json({error:'unknown_provider'});
  const code = req.query.code;
  const cookies = Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=')));
  const state = cookies['oidc_state']; const nonce = cookies['oidc_nonce'];
  // Exchange code for tokens
  const tokenUrl = p.issuer.replace(/\/$/,'') + '/token';
  const r = await fetch(tokenUrl, { method:'POST', headers:{ 'content-type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type:'authorization_code', code, redirect_uri:p.redirect_uri, client_id:p.client_id, client_secret:p.client_secret }) });
  const tokens = await r.json();
  const idt = tokens.id_token;
  const decoded = jwt.decode(idt, { complete: true });
  const kid = decoded.header.kid;
  const client = getJwks(p.issuer);
  const key = await client.getSigningKey(kid);
  const pub = key.getPublicKey();
  const claims = jwt.verify(idt, pub, { audience: p.client_id, issuer: p.issuer });
  if(claims.nonce !== nonce) return res.status(400).json({error:'nonce_mismatch'});
  // mint app token (demo)
  const app = jwt.sign({ sub: claims.sub, email: claims.email, tenant_id: claims.tid||'demo-tenant' }, process.env.APP_JWT_SECRET||'devsecret', { expiresIn: '8h' });
  res.redirect(`/portal?login=${providerId}&ok=1&token=${app}`);
}
