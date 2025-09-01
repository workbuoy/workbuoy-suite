import rateLimit from '../../../../lib/middleware/rate-limit.js';

export default function handler(req, res) {
  if (rateLimit(req, res)) return;
  res.status(200).json({ status: 'live' });
}
