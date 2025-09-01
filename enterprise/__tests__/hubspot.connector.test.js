// __tests__/hubspot.connector.test.js
const { HubSpotConnector } = require('../lib/connectors/hubspot');

describe('HubSpotConnector OAuth + fetch (fixtures in test)', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  test('builds authorization URL', () => {
    process.env.HUBSPOT_CLIENT_ID = 'client123';
    process.env.HUBSPOT_REDIRECT_URI = 'https://example.com/callback';
    const hub = new HubSpotConnector({});
    const url = hub.getAuthorizationUrl('abc');
    expect(url).toContain('client_id=client123');
    expect(url).toContain('redirect_uri=' + encodeURIComponent('https://example.com/callback'));
    expect(url).toContain('state=abc');
  });

  test('returns contacts from fixtures in test env', async () => {
    const hub = new HubSpotConnector({});
    const data = await hub.fetchContacts({ limit: 2 });
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThanOrEqual(1);
  });

  test('returns deals from fixtures in test env', async () => {
    const hub = new HubSpotConnector({});
    const data = await hub.fetchDeals({ limit: 2 });
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThanOrEqual(1);
  });

  test('healthCheck ok in test env', async () => {
    const hub = new HubSpotConnector({});
    const health = await hub.healthCheck({});
    expect(health.ok).toBe(true);
    expect(health.latency_ms).toBeGreaterThanOrEqual(0);
  });
});
