// pages/api/integration/health.js
// Aggregates integration health; includes HubSpot.

const { HubSpotConnector } = require('../../../lib/connectors/hubspot');

// Optionally wire a db adapter if available
const db = null;

export default async function handler(req, res) {
  const hubspot = new HubSpotConnector({ db });
  const hubspotHealth = await hubspot.healthCheck({});

  // If you already have other connectors, merge them here.
  const payload = {
    connectors: {
      hubspot: hubspotHealth
    }
  };
  res.status(200).json(payload);
}
