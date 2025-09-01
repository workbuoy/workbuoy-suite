
import { write as worm } from '../../../../lib/audit.js';
import policy from '../../../../secure.policy.json';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user_email } = req.body || {};
  if (policy?.secure_defaults?.global?.force_read_only) return res.status(403).json({ error: 'policy_denied' });
  const __db_mod = await import('../../../../lib/db'); const db = __db_mod.default || __db_mod;
  const stmt = db.prepare('INSERT INTO dsr_requests(type, user_email, status, sla_hours, evidence) VALUES (?,?,?,?,?)');
  const info = stmt.run('erasure', user_email, 'open', 72, JSON.stringify({}));
  worm({ type: 'dsr_erasure', id: info.lastInsertRowid, user_email });
  res.status(200).json({ id: info.lastInsertRowid, status: 'open' });
}
