import { Router } from 'express';
import jwt from 'jsonwebtoken';
import cookie from 'cookie-parser';
import * as oidc from 'openid-client';
import type { ClientMetadata, Configuration } from 'openid-client';
import { audit } from '../audit/audit.js';

const SSO_ENABLED = (process.env.SSO_ENABLED || 'true') === 'true';
const DEV_MOCK = (process.env.OIDC_DEV_MOCK || '1') === '1';

const JWT_SECRET = process.env.SESSION_SECRET || 'dev-secret';
const COOKIE_NAME = 'wb_sess';

const issuerUrl = process.env.OIDC_ISSUER_URL || '';
const clientId = process.env.OIDC_CLIENT_ID || '';
const clientSecret = process.env.OIDC_CLIENT_SECRET || '';
const callbackUrl = process.env.OIDC_CALLBACK_URL || 'http://localhost:3000/auth/callback';

type Sess = { sub: string; email?: string; name?: string; roles?: string[]; tenant_id: string };
type AuthorizationSession = { state: string; codeVerifier: string };

let configuration: Configuration | null = null;

async function getConfiguration(): Promise<Configuration> {
  if (configuration) return configuration;
  if (!issuerUrl) {
    throw new Error('OIDC_ISSUER_URL not configured');
  }
  const metadata: Partial<ClientMetadata> = {
    client_secret: clientSecret || undefined,
    redirect_uris: [callbackUrl],
    response_types: ['code'],
    token_endpoint_auth_method: clientSecret ? 'client_secret_post' : 'none'
  };
  configuration = await oidc.discovery(new URL(issuerUrl), clientId, metadata);
  return configuration;
}

function buildCallbackUrl(req: any) {
  const base = `${req.protocol || 'http'}://${req.get?.('host') || 'localhost:3000'}`;
  return new URL(req.originalUrl || req.url, base);
}

export function ssoRouter() {
  const r = Router();
  r.use(cookie());

  let sessionStore: AuthorizationSession | null = null;

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
      const config = await getConfiguration();
      const state = oidc.randomState();
      const codeVerifier = oidc.randomPKCECodeVerifier();
      const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
      sessionStore = { state, codeVerifier };
      const authUrl = oidc.buildAuthorizationUrl(config, {
        redirect_uri: callbackUrl,
        scope: 'openid email profile',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });
      res.redirect(authUrl.toString());
    } catch (e) {
      res.status(500).send(String(e));
    }
  });

  r.get('/auth/callback', async (req, res) => {
    if (DEV_MOCK) return res.redirect('/');
    try {
      const config = await getConfiguration();
      const currentUrl = buildCallbackUrl(req);
      const checks = sessionStore
        ? {
            pkceCodeVerifier: sessionStore.codeVerifier,
            expectedState: sessionStore.state
          }
        : undefined;
      const tokenSet = await oidc.authorizationCodeGrant(config, currentUrl, checks);
      const claims = tokenSet.claims?.() ?? {};
      const tenant_id = String(req.header('x-tenant-id') || 'demo-tenant');
      const roles: string[] = Array.isArray((claims as any).roles)
        ? ((claims as any).roles as string[])
        : ((claims as any)['https://workbuoy/roles'] as string[] | undefined) || [];
      const tok = jwt.sign(
        {
          sub: String((claims as any).sub || ''),
          email: (claims as any).email,
          name: (claims as any).name,
          roles,
          tenant_id
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.cookie(COOKIE_NAME, tok, { httpOnly: true, sameSite: 'lax', secure: false });
      audit({ type: 'user.login', tenant_id, actor_id: String((claims as any).sub || ''), details: { method: 'oidc' } });
      sessionStore = null;
      res.redirect('/');
    } catch (e) {
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
