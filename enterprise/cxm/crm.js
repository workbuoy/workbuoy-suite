// pages/api/cxm/crm.js
// Replaces mock with HubSpot read-only data for contacts/deals.
// GET /api/cxm/crm?type=contacts|deals&limit=25

const { HubSpotConnector } = require('../../../lib/connectors/hubspot');

// Optional token store interface (replace with your own implementation).
const tokenStore = {
  async get(userId) {
    // TODO: wire to your persistence. For now, read from env (dev only).
    if (process.env.HUBSPOT_PRIVATE_APP_TOKEN) return { access_token: process.env.HUBSPOT_PRIVATE_APP_TOKEN };
    throw new Error('No token store configured. Provide HUBSPOT_PRIVATE_APP_TOKEN or inject tokenStore.');
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const type = String(req.query.type || 'contacts');
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '25', 10)));
  const hubspot = new (require('../../../lib/connectors/hubspot').HubSpotConnector)({ tokenStore });

  try {
    let data;
    if (type === 'deals') {
      data = await hubspot.fetchDeals({ limit });
    } else {
      data = await hubspot.fetchContacts({ limit });
    }
    return res.status(200).json({ source: 'hubspot', type, limit, data });
  } catch (e) {
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || 'hubspot_error', status });
  }
}
