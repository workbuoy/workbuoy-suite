// pages/api/cxm/crm/notes.preview.js
// POST /api/cxm/crm/notes:preview  (via next.config.js rewrite)
// Body: { objectType: 'contact'|'deal', objectId: '123', body: 'text' }

const { HubSpotConnector } = require('../../../../lib/connectors/hubspot');

// Optional: tsunami/approve.js integration (best-effort).
// We try to import it; if unavailable, we'll still return requiresApproval: true.
let approver = null;
try {
  approver = require('../../../../tsunami/approve.js');
} catch (e) {
  approver = null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const payload = req.body || {};
  const hubspot = new HubSpotConnector({});

  try {
    const { preview, requiresApproval } = await hubspot.previewNote(payload, {});
    let approval = { required: true };

    if (approver && typeof approver.prepare === 'function') {
      try {
        const prep = await approver.prepare({
          connector: 'hubspot',
          action: 'create_note',
          payload,
          preview,
        });
        approval = { required: true, flow: 'tsunami/approve', id: prep.id };
      } catch (e) {
        approval = { required: true, flow: 'tsunami/approve', error: e.message };
      }
    } else {
      approval = { required: true, flow: 'none', hint: 'tsunami/approve.js not available' };
    }

    return res.status(200).json({ preview, approval, requiresApproval });
  } catch (e) {
    const status = e.status || 400;
    return res.status(status).json({ error: e.message || 'preview_failed', status });
  }
}
