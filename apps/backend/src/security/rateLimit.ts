import rateLimit from 'express-rate-limit';

export function buildWebhookLimiter() {
  const windowMs = parseInt(process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS || (60_000).toString(), 10);
  const max = parseInt(process.env.RATE_LIMIT_WEBHOOK_MAX || '120', 10);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false
  });
}

export function buildApiLimiter() {
  const windowMs = parseInt(process.env.RATE_LIMIT_API_WINDOW_MS || (60_000).toString(), 10);
  const max = parseInt(process.env.RATE_LIMIT_API_MAX || '600', 10);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false
  });
}
