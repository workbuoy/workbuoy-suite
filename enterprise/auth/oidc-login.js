
import { Issuer, generators } from 'openid-client';
import { auditLog } from '../../../lib/audit.js';
import { rateLimit } from '../../../lib/rate-limit.js';

let _client = null;
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
  if(!rateLimit(req, res, { key:'oidc-login', windowMs: 60000, max: 30 })) return;
  const c = await client();
  const state = generators.state();
  const nonce = generators.nonce();
  const code_verifier = generators.codeVerifier();
  const code_challenge = generators.codeChallenge(code_verifier);

  res.setHeader('Set-Cookie', [
    `oidc_state=${state}; HttpOnly; Path=/; SameSite=Lax`,
    `oidc_nonce=${nonce}; HttpOnly; Path=/; SameSite=Lax`,
    `pkce_verifier=${code_verifier}; HttpOnly; Path=/; SameSite=Lax`
  ]);

  const url = c.authorizationUrl({
    scope: 'openid email profile',
    state, nonce,
    code_challenge,
    code_challenge_method: 'S256'
  });
  auditLog({ action:'auth:oidc:start', details:{ state } });
  res.redirect(url);
}
