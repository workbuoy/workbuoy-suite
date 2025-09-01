// Simple token-bucket per IP/User
const buckets = new Map();

const RATE = parseInt(process.env.WB_RATE_LIMIT_PER_MIN || '120', 10);
const BURST = parseInt(process.env.WB_RATE_LIMIT_BURST || '60', 10);

function keyFromReq(req) {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').toString();
  const uid = req.headers['x-user-id'] || 'anon';
  return `${ip}:${uid}`;
}

export default function rateLimit(req, res) {
  const now = Date.now();
  const key = keyFromReq(req);
  const b = buckets.get(key) || { tokens: BURST, last: now };
  const elapsed = (now - b.last) / 60000; // minutes
  b.tokens = Math.min(BURST, b.tokens + elapsed * RATE);
  b.last = now;
  if (b.tokens < 1) {
    const retrySec = Math.ceil(60 / RATE);
    res.setHeader('Retry-After', String(retrySec));
    res.status(429).json({ error: 'rate_limited' });
    buckets.set(key, b);
    return true;
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return false;
}
