
import { write as worm } from '../../../../lib/audit.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user_email } = req.body || {};
  const __db_mod = await import('../../../../lib/db'); const db = __db_mod.default || __db_mod;
  const stmt = db.prepare('INSERT INTO dsr_requests(type, user_email, status, sla_hours, evidence) VALUES (?,?,?,?,?)');
  const info = stmt.run('access', user_email, 'open', 72, JSON.stringify({}));
  worm({ type: 'dsr_access', id: info.lastInsertRowid, user_email });
  res.status(200).json({ id: info.lastInsertRowid, status: 'open' });
}
