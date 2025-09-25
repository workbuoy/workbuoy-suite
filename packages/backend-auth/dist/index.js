import { Router } from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import * as oidc from 'openid-client';
const DEFAULT_COOKIE_NAME = 'wb_sess';
const DEFAULT_CALLBACK_URL = 'http://localhost:3000/auth/callback';
const DEV_LOGIN_ACTOR = { sub: 'user-dev', email: 'dev@example.com', name: 'Dev User', roles: ['admin'] };
function resolveOptions(options = {}) {
    return {
        ssoEnabled: options.ssoEnabled ?? (process.env.SSO_ENABLED ?? 'true') === 'true',
        devMock: options.devMock ?? (process.env.OIDC_DEV_MOCK ?? '1') === '1',
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
function buildCallbackUrl(req) {
    const base = `${req.protocol || 'http'}://${req.get?.('host') || 'localhost:3000'}`;
    return new URL(req.originalUrl ?? req.url, base);
}
function createConfigurationResolver(options) {
    let configuration = null;
    return async function getConfiguration() {
        if (configuration)
            return configuration;
        if (!options.issuerUrl) {
            throw new Error('OIDC_ISSUER_URL not configured');
        }
        const metadata = {
            client_secret: options.clientSecret || undefined,
            redirect_uris: [options.callbackUrl],
            response_types: ['code'],
            token_endpoint_auth_method: options.clientSecret ? 'client_secret_post' : 'none',
        };
        configuration = await oidc.discovery(new URL(options.issuerUrl), options.clientId, metadata);
        return configuration;
    };
}
function signSession(payload, secret, expiresIn) {
    const options = { expiresIn };
    return jwt.sign(payload, secret, options);
}
function createRouter(options) {
    const router = Router();
    router.use(cookieParser());
    const getConfiguration = createConfigurationResolver(options);
    let sessionStore = null;
    router.get('/auth/login', async (req, res) => {
        const tenant_id = String(req.query.tenant || req.header('x-tenant-id') || options.defaultTenantId);
        if (!options.ssoEnabled) {
            res.status(404).send('SSO disabled');
            return;
        }
        if (options.devMock) {
            const token = signSession({ ...DEV_LOGIN_ACTOR, tenant_id }, options.jwtSecret, '1h');
            res.cookie(options.cookieName, token, { httpOnly: true, sameSite: 'lax' });
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
        }
        catch (err) {
            res.status(500).send(String(err));
        }
    });
    router.get('/auth/callback', async (req, res) => {
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
            const roles = Array.isArray(claims.roles)
                ? claims.roles
                : claims['https://workbuoy/roles'] || [];
            const token = signSession({
                sub: String(claims.sub || ''),
                email: claims.email,
                name: claims.name,
                roles,
                tenant_id,
            }, options.jwtSecret, '8h');
            res.cookie(options.cookieName, token, { httpOnly: true, sameSite: 'lax', secure: false });
            options.audit?.({
                type: 'user.login',
                tenant_id,
                actor_id: String(claims.sub || ''),
                details: { method: 'oidc' },
            });
            sessionStore = null;
            res.redirect('/');
        }
        catch (err) {
            res.status(500).send(String(err));
        }
    });
    router.post('/auth/logout', (req, res) => {
        res.clearCookie(options.cookieName);
        res.json({ ok: true });
    });
    router.get('/auth/me', (req, res) => {
        const raw = req.cookies?.[options.cookieName];
        if (!raw) {
            res.status(401).json({ error: 'unauthenticated' });
            return;
        }
        try {
            const sess = jwt.verify(raw, options.jwtSecret);
            res.json({
                sub: sess.sub,
                email: sess.email,
                name: sess.name,
                roles: sess.roles || [],
                tenant_id: sess.tenant_id,
            });
        }
        catch {
            res.status(401).json({ error: 'invalid' });
        }
    });
    return router;
}
function createMiddleware(options) {
    return function requireAuth(req, res, next) {
        const raw = req.cookies?.[options.cookieName];
        if (!raw) {
            res.status(401).json({ error: 'unauthenticated' });
            return;
        }
        try {
            const sess = jwt.verify(raw, options.jwtSecret);
            req.actor_user_id = sess.sub;
            req.roles = sess.roles || [];
            req.tenant_id = sess.tenant_id || options.defaultTenantId;
            next();
        }
        catch {
            res.status(401).json({ error: 'invalid' });
        }
    };
}
export function createAuthRouter(options) {
    return createRouter(resolveOptions(options));
}
export function createRequireAuth(options) {
    return createMiddleware(resolveOptions(options));
}
export function createAuthModule(options) {
    const resolved = resolveOptions(options);
    return {
        router: createRouter(resolved),
        requireAuth: createMiddleware(resolved),
    };
}
export { createAuthRouter as AuthRouter };
//# sourceMappingURL=index.js.map