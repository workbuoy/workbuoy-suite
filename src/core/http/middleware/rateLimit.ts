import rateLimit from "express-rate-limit";

/**
 * Basic rate limiter for write endpoints.
 * Defaults: 100 requests / 1 minute per IP.
 * Configure via env: RATE_WINDOW_MS, RATE_MAX
 */
export function writeRateLimiter() {
  const windowMs = Number(process.env.RATE_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_MAX || 100);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "rate_limited", retry_after_ms: windowMs },
  });
}
