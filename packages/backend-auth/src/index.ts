import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Router } from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import * as oidc from 'openid-client';
import type { ClientMetadata, Configuration } from 'openid-client';

export type AuthAuditEvent = {
  type: string;
  tenant_id: string;
  actor_id: string;
  details?: Record<string, unknown>;
};

export type AuditLogger = (event: AuthAuditEvent) => void;

export interface AuthRouterOptions {
  /** Toggle SSO endpoints. Defaults to process.env.SSO_ENABLED. */
  ssoEnabled?: boolean;
  /** Enable the development mock login flow. Defaults to process.env.OIDC_DEV_MOCK. */
  devMock?: boolean;
  /** Secret used for signing JWT cookies. Defaults to process.env.SESSION_SECRET. */
  jwtSecret?: string;
  /** Name of the session cookie. Defaults to `wb_sess`. */
  cookieName?: string;
  /** Default tenant fallback when not provided by request. */
  defaultTenantId?: string;
  /** OIDC issuer discovery URL. */
  issuerUrl?: string;
  /** OIDC client ID. */
  clientId?: string;
  /** OIDC client secret. */
  clientSecret?: string;
  /** Callback URL registered with the IdP. */
  callbackUrl?: string;
  /** Optional audit hook invoked on login flows. */
  audit?: AuditLogger;
}

export interface AuthenticatedRequest extends Request {
  actor_user_id?: string;
  roles?: string[];
  tenant_id?: string;
}

type AuthorizationSession = { state: string; codeVerifier: string };
type RequestWithCookies = Request & { cookies?: Record<string, string | undefined> };

type ResolvedOptions = {
  ssoEnabled: boolean;
  devMock: boolean;
  jwtSecret: string;
  cookieName: string;
  defaultTenantId: string;
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  audit?: AuditLogger;
};

type SessionPayload = {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
  tenant_id: string;
};

const DEFAULT_COOKIE_NAME = 'wb_sess';
const DEFAULT_CALLBACK_URL = 'http://localhost:3000/auth/callback';
const DEV_LOGIN_ACTOR = { sub: 'user-dev', email: 'dev@example.com', name: 'Dev User', roles: ['admin'] };

function resolveOptions(options: AuthRouterOptions = {}): ResolvedOptions {
  return {
    ssoEnabled: options.ssoEnabled ?? (process.env.SSO_ENABLED ?? 'true') === 'true',
    devMock: options.devMock ?? (process.env.OIDC_DEV_MOCK ?? '0') === '1',
    jwtSecret: options.jwtSecret ?? process.env.SESSION_SECRET ?? 'dev-secret',
    cookieName: options.cookieName ?? process.env.SESSION_COOKIE ?? DEFAULT_COOKIE_NAME,
    defaultTenantId: options.defaultTenantId ?? process.env.DEFAULT_TENANT_ID ?? 'demo-tenant',
    issuerUrl: options.issuerUrl ?? process.env.OIDC_ISSUER_URL ?? '',
    clientId: options.clientId ?? process.env.OIDC_CLIENT_ID ?? '',
    clientSecret: options.clientSecret ?? process.env.OIDC_CLIENT_SECRET ?? '',
    callbackUrl: options.callbackUrl ?? process.env.OIDC_CALLBACK_URL ?? DEFAULT_CALLBACK_URL,
    audit: options.audit,
  };
}

function buildCallbackUrl(req: Request): URL {
  const base = `${(req.protocol as string) || 'http'}://${req.get?.('host') || 'localhost:3000'}`;
  return new URL((req as Request & { originalUrl?: string }).originalUrl ?? req.url, base);
}

function createConfigurationResolver(options: ResolvedOptions) {
  let configuration: Configuration | null = null;
  return async function getConfiguration() {
    if (configuration) return configuration;
    if (!options.issuerUrl) {
      throw new Error('OIDC_ISSUER_URL not configured');
    }
    const metadata: Partial<ClientMetadata> = {
      client_secret: options.clientSecret || undefined,
      redirect_uris: [options.callbackUrl],
      response_types: ['code'],
      token_endpoint_auth_method: options.clientSecret ? 'client_secret_post' : 'none',
    };
    configuration = await oidc.discovery(new URL(options.issuerUrl), options.clientId, metadata);
    return configuration;
  };
}

function signSession(payload: SessionPayload, secret: Secret, expiresIn: SignOptions['expiresIn']) {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, options);
}

function createRouter(options: ResolvedOptions) {
  const router = Router();
  router.use(cookieParser());

  const getConfiguration = createConfigurationResolver(options);
  let sessionStore: AuthorizationSession | null = null;
  const secure = process.env.NODE_ENV === 'production';
  const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure };

  router.get('/auth/login', async (req: AuthenticatedRequest, res: Response) => {
    const tenant_id = String(req.query.tenant || req.header('x-tenant-id') || options.defaultTenantId);
    if (!options.ssoEnabled) {
      res.status(404).send('SSO disabled');
      return;
    }
    if (options.devMock) {
      const token = signSession({ ...DEV_LOGIN_ACTOR, tenant_id }, options.jwtSecret, '1h');
      res.cookie(options.cookieName, token, cookieOptions);
      options.audit?.({ type: 'user.login', tenant_id, actor_id: DEV_LOGIN_ACTOR.sub, details: { method: 'mock' } });
      res.redirect('/');
      return;
    }

    try {
      const config = await getConfiguration();
      const state = oidc.randomState();
      const codeVerifier = oidc.randomPKCECodeVerifier();
      const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
      sessionStore = { state, codeVerifier };
      const authUrl = oidc.buildAuthorizationUrl(config, {
        redirect_uri: options.callbackUrl,
        scope: 'openid email profile',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });
      res.redirect(authUrl.toString());
    } catch (err) {
      res.status(500).send(String(err));
    }
  });

  router.get('/auth/callback', async (req: AuthenticatedRequest, res: Response) => {
    if (options.devMock) {
      res.redirect('/');
      return;
    }
    try {
      const config = await getConfiguration();
      const currentUrl = buildCallbackUrl(req);
      const checks = sessionStore
        ? {
            pkceCodeVerifier: sessionStore.codeVerifier,
            expectedState: sessionStore.state,
          }
        : undefined;
      const tokenSet = await oidc.authorizationCodeGrant(config, currentUrl, checks);
      const claims = tokenSet.claims?.() ?? {};
      const tenant_id = String(req.header('x-tenant-id') || options.defaultTenantId);
      const roles: string[] = Array.isArray((claims as any).roles)
        ? ((claims as any).roles as string[])
        : ((claims as any)['https://workbuoy/roles'] as string[] | undefined) || [];
      const token = signSession(
        {
          sub: String((claims as any).sub || ''),
          email: (claims as any).email,
          name: (claims as any).name,
          roles,
          tenant_id,
        },
        options.jwtSecret,
        '8h',
      );
      res.cookie(options.cookieName, token, cookieOptions);
      options.audit?.({
        type: 'user.login',
        tenant_id,
        actor_id: String((claims as any).sub || ''),
        details: { method: 'oidc' },
      });
      sessionStore = null;
      res.redirect('/');
    } catch (err) {
      res.status(500).send(String(err));
    }
  });

  router.post('/auth/logout', (req: AuthenticatedRequest, res: Response) => {
    res.clearCookie(options.cookieName, cookieOptions);
    res.json({ ok: true });
  });

  router.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
    const raw = (req as RequestWithCookies).cookies?.[options.cookieName];
    if (!raw) {
      res.status(401).json({ error: 'unauthenticated' });
      return;
    }
    try {
      const sess = jwt.verify(raw, options.jwtSecret) as SessionPayload;
      res.json({
        sub: sess.sub,
        email: sess.email,
        name: sess.name,
        roles: sess.roles || [],
        tenant_id: sess.tenant_id,
      });
    } catch {
      res.status(401).json({ error: 'invalid' });
    }
  });

  return router;
}

function createMiddleware(options: ResolvedOptions): RequestHandler {
  return function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const raw = (req as RequestWithCookies).cookies?.[options.cookieName];
    if (!raw) {
      res.status(401).json({ error: 'unauthenticated' });
      return;
    }
    try {
      const sess = jwt.verify(raw, options.jwtSecret) as SessionPayload;
      req.actor_user_id = sess.sub;
      req.roles = sess.roles || [];
      req.tenant_id = sess.tenant_id || options.defaultTenantId;
      next();
    } catch {
      res.status(401).json({ error: 'invalid' });
    }
  };
}

export function createAuthRouter(options?: AuthRouterOptions) {
  return createRouter(resolveOptions(options));
}

export function createRequireAuth(options?: AuthRouterOptions) {
  return createMiddleware(resolveOptions(options));
}

export function createAuthModule(options?: AuthRouterOptions) {
  const resolved = resolveOptions(options);
  return {
    router: createRouter(resolved),
    requireAuth: createMiddleware(resolved),
  };
}

export type { AuthRouterOptions as AuthModuleOptions };
export { createAuthRouter as AuthRouter };
