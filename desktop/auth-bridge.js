
const { session } = require('electron');
const { fetch } = require('undici');
const log = require('./logger').create('auth');
const { incTokenRenews } = require('./metrics');

let tokenCache = { bearer: null, exp: 0 };

function originFrom(urlStr) {
  try { const u = new URL(urlStr); return `${u.protocol}//${u.host}`; } catch { return null; }
}

function redact(s) {
  if (!s) return s;
  return s.replace(/[A-Za-z0-9-_]{8,}\.[A-Za-z0-9-_]{8,}\.[A-Za-z0-9-_]{8,}/g, '***.***.***');
}

async function getCookieHeader(origin) {
  const cookies = await session.defaultSession.cookies.get({ url: origin });
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

/**
 * Refresh a short-lived bearer token using cookie session.
 * Expects JSON {{ access_token, expires_in }} from WB_AUTH_REFRESH_PATH.
 */
async function refreshBearerWithCookie(portalUrl) {
  try {
    const origin = originFrom(portalUrl);
    const cookieHeader = await getCookieHeader(origin);
    const refreshPath = process.env.WB_AUTH_REFRESH_PATH || '/auth/refresh';
    const url = `${origin}${refreshPath}`;
    const res = await fetch(url, { headers: { cookie: cookieHeader }, redirect: 'manual' });
    if (!res.ok) throw new Error(`refresh failed ${res.status}`);
    const data = await res.json();
    tokenCache.bearer = data.access_token;
    tokenCache.exp = Date.now() + Math.max(30_000, (data.expires_in || 600) * 1000 - 10_000);
    incTokenRenews();
    log.info('[auth] token refreshed');
  } catch (e) {
    log.error('[auth] refresh error', e.message);
    throw e;
  }
}

async function getAuthContext({ portalUrl, preferBearer }) {
  const origin = originFrom(portalUrl);
  let cookieHeader = '';
  try { cookieHeader = await getCookieHeader(origin); } catch (e) { log.warn('[auth] cookie read failed'); }
  if (preferBearer) {
    if (!tokenCache.bearer || Date.now() >= tokenCache.exp) {
      await refreshBearerWithCookie(portalUrl);
    }
    return { cookieHeader, bearer: tokenCache.bearer };
  }
  // Try to infer bearer from cookies fallback
  const tokenFromCookie = (cookieHeader.match(/(?:token|auth|jwt)=([^;]+)/i)||[])[1];
  return { cookieHeader, bearer: tokenFromCookie || null };
}

module.exports = { getAuthContext, refreshBearerWithCookie };
