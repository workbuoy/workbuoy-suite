// lib/connectors/hubspot.js
// Read-only HubSpot connector with OAuth2 flow + health check + fixtures in NODE_ENV=test.
// Also exposes a "previewNote" helper that does a dry-run writeback diff.
//
// Usage:
//   const hubspot = new HubSpotConnector({ tokenStore, logger });
//   const url = hubspot.getAuthorizationUrl(state);
//   const token = await hubspot.exchangeCodeForToken(code);
//   const contacts = await hubspot.fetchContacts({ limit: 10 });
//
// Env vars supported:
//   HUBSPOT_CLIENT_ID
//   HUBSPOT_CLIENT_SECRET
//   HUBSPOT_REDIRECT_URI               (e.g., https://app.example.com/api/oauth/hubspot/callback)
//   HUBSPOT_SCOPES                     (comma-separated, e.g., "crm.objects.contacts.read,crm.objects.deals.read,oauth")
//   HUBSPOT_PRIVATE_APP_TOKEN          (optional; if set, used instead of OAuth during development)
//   HUBSPOT_BASE_URL                   (optional; defaults https://api.hubapi.com)
//   WB_CONNECTOR_ENABLE_FIXTURES       (optional; '1' forces fixtures even outside test)
//   NODE_ENV
//
// NOTE: This code is intentionally defensive: if HubSpot is unreachable, we increment
// a process-wide error counter (via lib/metrics.js) and throw a descriptive error.
// Health stats can be persisted if a db adapter is provided.

const __fetch_mod = await import('node-fetch'); const fetch = __fetch_mod.default || __fetch_mod; // v2 in CJS environments
const { performance } = require('perf_hooks');
const { incrementConnectorError } = require('../metrics');

const DEFAULT_SCOPES = process.env.HUBSPOT_SCOPES || 'crm.objects.contacts.read,crm.objects.deals.read,oauth';
const HUBSPOT_BASE_URL = process.env.HUBSPOT_BASE_URL || 'https://api.hubapi.com';
const IS_TEST = process.env.NODE_ENV === 'test' || process.env.WB_CONNECTOR_ENABLE_FIXTURES === '1';

function loadFixture(name) {
  // test/fixtures/{name}.json
  try {
    const data = require(`../../test/fixtures/${name}.json`);
    return data;
  } catch (e) {
    return null;
  }
}

class HubSpotConnector {
  constructor({ tokenStore = null, logger = console, db = null } = {}) {
    this.clientId = process.env.HUBSPOT_CLIENT_ID;
    this.clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
    this.redirectUri = process.env.HUBSPOT_REDIRECT_URI;
    this.scopes = DEFAULT_SCOPES;
    this.tokenStore = tokenStore; // required in prod
    this.logger = logger;
    this.db = db; // optional: a { query(sql, params) } adapter
    this.privateToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN || null;
  }

  getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      state: state || '',
      response_type: 'code',
    });
    return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    const url = `${HUBSPOT_BASE_URL}/oauth/v1/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code,
    });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const json = await res.json();
    if (!res.ok) {
      this._recordError(`token_exchange_failed: ${res.status} ${JSON.stringify(json)}`);
      throw new Error(`HubSpot token exchange failed: ${res.status}`);
    }
    return json; // { access_token, refresh_token, expires_in, ... }
  }

  async refreshAccessToken(refreshToken) {
    const url = `${HUBSPOT_BASE_URL}/oauth/v1/token`;
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const json = await res.json();
    if (!res.ok) {
      this._recordError(`token_refresh_failed: ${res.status} ${JSON.stringify(json)}`);
      throw new Error(`HubSpot token refresh failed: ${res.status}`);
    }
    return json;
  }

  async _authorizedHeaders(userId) {
    // Prefer private app token when set; otherwise use OAuth token store.
    if (this.privateToken) {
      return { Authorization: `Bearer ${this.privateToken}` };
    }
    if (!this.tokenStore) {
      throw new Error('HubSpot token store not configured');
    }
    const token = await this.tokenStore.get(userId);
    if (!token) throw new Error('HubSpot access token missing for user');
    return { Authorization: `Bearer ${token.access_token}` };
  }

  async _request(path, { userId = null, qs = {}, method = 'GET', body = null } = {}) {
    if (IS_TEST) {
      // During tests, short-circuit to fixture-aware helpers by calling public methods.
      // _request shouldn't be called in fixture mode. Guard here anyway.
      throw new Error('Unexpected network call in test fixture mode');
    }

    const headers = await this._authorizedHeaders(userId);
    const url = new URL(`${HUBSPOT_BASE_URL}${path}`);
    Object.entries(qs || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });

    const started = performance.now();
    const res = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const latency = Math.round(performance.now() - started);
    let json;
    try {
      json = await res.json();
    } catch (e) {
      json = { error: 'invalid_json' };
    }

    if (!res.ok) {
      this._recordError(`http_${res.status}: ${path} -> ${JSON.stringify(json).slice(0, 400)}`);
      const err = new Error(`HubSpot API ${res.status}: ${path}`);
      err.status = res.status;
      err.payload = json;
      err.latency = latency;
      throw err;
    }

    await this._recordSuccess(latency);
    return json;
  }

  // Public: fetch a small list of contacts
  async fetchContacts({ limit = 25, properties = ['firstname','lastname','email'], userId = null } = {}) {
    if (IS_TEST) {
      const fx = loadFixture('hubspot_contacts');
      return fx || { results: [] };
    }
    return this._request('/crm/v3/objects/contacts', {
      userId,
      qs: { limit, properties: properties.join(',') },
    });
  }

  // Public: fetch a small list of deals
  async fetchDeals({ limit = 25, properties = ['dealname','amount','dealstage'], userId = null } = {}) {
    if (IS_TEST) {
      const fx = loadFixture('hubspot_deals');
      return fx || { results: [] };
    }
    return this._request('/crm/v3/objects/deals', {
      userId,
      qs: { limit, properties: properties.join(',') },
    });
  }

  // Health check: quick call that records latency and last_success
  async healthCheck({ userId = null } = {}) {
    const began = performance.now();
    try {
      if (IS_TEST) {
        // simulate fast health in tests
        const latency = Math.round(performance.now() - began) + 5;
        await this._recordSuccess(latency);
        return { ok: true, latency_ms: latency, last_success: new Date().toISOString() };
      }
      // lightweight endpoint — 1 item is enough
      await this._request('/crm/v3/objects/contacts', { userId, qs: { limit: 1, properties: 'email' } });
      const latency = Math.round(performance.now() - began);
      await this._recordSuccess(latency);
      return { ok: true, latency_ms: latency, last_success: new Date().toISOString() };
    } catch (e) {
      this._recordError(`health_check_failed: ${e.message}`);
      return { ok: false, error: e.message };
    }
  }

  // Dry-run preview for adding a note to a contact/deal (no write).
  // payload = { objectType: 'contact'|'deal', objectId: '123', body: 'text' }
  async previewNote(payload, { userId = null } = {}) {
    const { objectType, objectId, body } = payload || {};
    if (!objectType || !objectId || !body) {
      const err = new Error('Invalid payload: objectType, objectId, and body are required');
      err.status = 400;
      throw err;
    }
    // In read-only mode, we do not POST. We just assemble a preview diff.
    let existingCount = 0;
    try {
      if (!IS_TEST) {
        // Optionally, you could pull existing notes to show context, but that requires
        // additional scopes and associations. Keep it minimal: fetch last note count if possible.
        // We'll try a harmless list call to objects/<type>
        const typePath = objectType === 'deal' ? 'deals' : 'contacts';
        await this._request(`/crm/v3/objects/${typePath}/${encodeURIComponent(objectId)}`, {
          userId,
          qs: { properties: 'hs_lastmodifieddate' },
        });
      }
    } catch (e) {
      // non-fatal for preview
      this.logger.warn('previewNote: context fetch failed (non-fatal)', e.message);
    }
    const diff = {
      action: 'create_note',
      target: { objectType, objectId },
      changes: [
        { field: 'body', from: null, to: String(body) }
      ],
      readOnly: true,
    };
    return {
      preview: diff,
      requiresApproval: true,
    };
  }

  async _recordSuccess(latencyMs) {
    if (this.db) {
      try {
        await this.db.query(
          `INSERT INTO integration_health (connector, last_success_at, last_latency_ms, error_count_total, consecutive_errors)
           VALUES ($1, NOW(), $2, COALESCE((SELECT error_count_total FROM integration_health WHERE connector=$1),0), 0)
           ON CONFLICT (connector) DO UPDATE SET
            last_success_at = EXCLUDED.last_success_at,
            last_latency_ms = EXCLUDED.last_latency_ms,
            consecutive_errors = 0`,
          ['hubspot', latencyMs]
        );
      } catch (e) {
        this.logger.warn('integration_health upsert failed (success):', e.message);
      }
    }
  }

  _recordError(msg) {
    try { incrementConnectorError('hubspot'); } catch (e) {}
    this.logger.error('[hubspot] ' + msg);
    if (this.db) {
      this.db.query(
        `INSERT INTO integration_health (connector, last_error_at, error_count_total, consecutive_errors)
         VALUES ($1, NOW(), 1, 1)
         ON CONFLICT (connector) DO UPDATE SET
          last_error_at = NOW(),
          error_count_total = integration_health.error_count_total + 1,
          consecutive_errors = integration_health.consecutive_errors + 1`,
        ['hubspot']
      ).catch(e => this.logger.warn('integration_health upsert failed (error):', e.message));
    }
  }
}

module.exports = { HubSpotConnector };
