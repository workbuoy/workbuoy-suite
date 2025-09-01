
import { write as worm } from '../../../../lib/audit.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user_email, purpose, status } = req.body || {};
  const __db_mod = await import('../../../../lib/db'); const db = __db_mod.default || __db_mod;
  db.prepare('INSERT INTO consents(user_email, purpose, status) VALUES (?,?,?)').run(user_email, purpose, status);
  worm({ type: 'consent_update', user_email, purpose, status });
  res.status(200).json({ ok: true });
}
