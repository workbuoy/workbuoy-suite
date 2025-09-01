import rateLimit from '../../../lib/middleware/rate-limit.js';
import rateLimit from '../../../../lib/middleware/rate-limit.js';
import '../../../../lib/bootstrap.js';
import { connectors, runConnector } from '../../../../lib/connectors/index.js';

async function handler(req, res) {
  if (rateLimit(req, res)) return;
  const since = req.query.since || null;
  const statuses = {}; const tenantId = (req.headers['x-tenant-id']||req.query.tenant_id||null);
  for (const name of Object.keys(connectors)) {
    try {
      const result = await runConnector(name, since, tenantId);
      statuses[name] = { ok: true, ...result };
    } catch (e) {
      statuses[name] = { ok: false, error: String(e) };
    }
  }
  res.status(200).json({ ok: true, status: Object.values(statuses) });
}

export default handler;
