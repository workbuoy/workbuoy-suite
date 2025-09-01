import { Router } from 'express';
import jwt from 'jsonwebtoken';
import cookie from 'cookie-parser';
import { Issuer, generators, Client } from 'openid-client';
import { audit } from '../audit/audit.js';

const SSO_ENABLED = (process.env.SSO_ENABLED || 'true') === 'true';
const DEV_MOCK = (process.env.OIDC_DEV_MOCK || '1') === '1';

const JWT_SECRET = process.env.SESSION_SECRET || 'dev-secret';
const COOKIE_NAME = 'wb_sess';

type Sess = { sub: string; email?: string; name?: string; roles?: string[]; tenant_id: string };

export function ssoRouter() {
  const r = Router();
  r.use(cookie());

  let client: Client|null = null;
  let issuerUrl = process.env.OIDC_ISSUER_URL || '';
  let clientId = process.env.OIDC_CLIENT_ID || '';
  let clientSecret = process.env.OIDC_CLIENT_SECRET || '';
  let callbackUrl = process.env.OIDC_CALLBACK_URL || 'http://localhost:3000/auth/callback';

  async function getClient() {
    if (client) return client;
    const iss = await Issuer.discover(issuerUrl);
    client = new iss.Client({ client_id: clientId, client_secret: clientSecret, redirect_uris: [callbackUrl], response_types: ['code'] });
    return client;
  }

  r.get('/auth/login', async (req, res) => {
    const tenant_id = String(req.query.tenant || req.header('x-tenant-id') || 'demo-tenant');
    if (!SSO_ENABLED) return res.status(404).send('SSO disabled');
    if (DEV_MOCK) {
      const tok = jwt.sign({ sub: 'user-dev', email: 'dev@example.com', name: 'Dev User', roles: ['admin'], tenant_id }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie(COOKIE_NAME, tok, { httpOnly: true, sameSite: 'lax' });
      audit({ type: 'user.login', tenant_id, actor_id: 'user-dev', details: { method: 'mock' } });
      return res.redirect('/');
    }
    try {
      const c = await getClient();
      const state = generators.state();
      const code_verifier = generators.codeVerifier();
      const code_challenge = generators.codeChallenge(code_verifier);
      (req as any).session = { state, code_verifier };
      const authUrl = c.authorizationUrl({ scope: 'openid email profile', state, code_challenge, code_challenge_method: 'S256' });
      res.redirect(authUrl);
    } catch (e:any) {
      res.status(500).send(String(e));
    }
  });

  r.get('/auth/callback', async (req, res) => {
    if (DEV_MOCK) return res.redirect('/');
    try {
      const c = await getClient();
      const params = c.callbackParams(req);
      const tokenSet = await c.callback(callbackUrl, params, { state: (req as any).session?.state, code_verifier: (req as any).session?.code_verifier });
      const id = tokenSet.claims();
      const tenant_id = String(req.header('x-tenant-id') || 'demo-tenant');
      const roles: string[] = Array.isArray((id as any).roles) ? (id as any).roles : ((id as any)['https://workbuoy/roles'] || []);
      const tok = jwt.sign({ sub: id.sub, email: id.email, name: id.name, roles, tenant_id }, JWT_SECRET, { expiresIn: '8h' });
      res.cookie(COOKIE_NAME, tok, { httpOnly: true, sameSite: 'lax', secure: false });
      audit({ type: 'user.login', tenant_id, actor_id: String(id.sub||''), details: { method: 'oidc' } });
      res.redirect('/');
    } catch (e:any) {
      res.status(500).send(String(e));
    }
  });

  r.post('/auth/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ ok: true });
  });

  r.get('/auth/me', (req, res) => {
    const raw = (req as any).cookies?.[COOKIE_NAME];
    if (!raw) return res.status(401).json({ error: 'unauthenticated' });
    try {
      const sess = jwt.verify(raw, JWT_SECRET) as Sess;
      res.json({ sub: sess.sub, email: sess.email, name: sess.name, roles: sess.roles || [], tenant_id: sess.tenant_id });
    } catch {
      res.status(401).json({ error: 'invalid' });
    }
  });

  return r;
}

export function requireAuth(req: any, res: any, next: any) {
  const raw = req.cookies?.[COOKIE_NAME];
  if (!raw) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const sess = jwt.verify(raw, JWT_SECRET) as Sess;
    req.actor_user_id = sess.sub;
    req.roles = sess.roles || [];
    req.tenant_id = sess.tenant_id || 'demo-tenant';
    next();
  } catch {
    res.status(401).json({ error: 'invalid' });
  }
}
