import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

export type AuthMethod = 'jwt'|'refresh';

export interface SfdcAuthConfig {
  method: AuthMethod;
  clientId: string;
  user?: string; // for JWT "sub"
  loginUrl: string; // https://login.salesforce.com or https://test.salesforce.com
  privateKeyBase64?: string; // for JWT
  refreshToken?: string; // for refresh flow
}

export async function getAccessToken(cfg: SfdcAuthConfig): Promise<string> {
  if (cfg.method === 'jwt') {
    if (!cfg.user || !cfg.privateKeyBase64) throw new Error('missing user/privateKey for JWT');
    const privateKey = Buffer.from(cfg.privateKeyBase64, 'base64').toString('utf8');
    const assertion = jwt.sign(
      { iss: cfg.clientId, sub: cfg.user, aud: cfg.loginUrl, exp: Math.floor(Date.now()/1000)+180 },
      privateKey,
      { algorithm: 'RS256' }
    );
    const url = cfg.loginUrl + '/services/oauth2/token';
    const body = new URLSearchParams();
    body.set('grant_type','urn:ietf:params:oauth:grant-type:jwt-bearer');
    body.set('assertion', assertion);
    const res = await fetch(url, { method:'POST', headers: { 'Content-Type':'application/x-www-form-urlencoded' }, body });
    if (!res.ok) throw new Error('sfdc jwt auth failed: '+res.status);
    const data: any = await res.json();
    return data.access_token;
  } else {
    if (!cfg.refreshToken) throw new Error('missing refreshToken');
    const url = cfg.loginUrl + '/services/oauth2/token';
    const body = new URLSearchParams();
    body.set('grant_type','refresh_token');
    body.set('client_id', cfg.clientId);
    body.set('refresh_token', cfg.refreshToken);
    const res = await fetch(url, { method:'POST', headers: { 'Content-Type':'application/x-www-form-urlencoded' }, body });
    if (!res.ok) throw new Error('sfdc refresh auth failed: '+res.status);
    const data: any = await res.json();
    return data.access_token;
  }
}
