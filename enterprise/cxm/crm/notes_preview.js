
import policy from '../../../../secure.policy.json';
import { write as worm } from '../../../../lib/audit.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { dealId, note } = req.body || {};
  // Policy gates
  if (policy?.secure_defaults?.global?.force_read_only) {
    return res.status(403).json({ error: 'policy_denied', reason: 'force_read_only' });
  }
  // Simulate fetching existing notes
  const existing = [{ id: 'n1', text: 'Old note' }];
  const diff = { add: [{ text: note }], remove: [] };
  const approvalToken = Buffer.from(JSON.stringify({ dealId, note, ts: Date.now() })).toString('base64');
  worm({ type: 'crm_write_preview', dealId });
  return res.status(200).json({ diff, approvalToken });
}
