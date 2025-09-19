interface StoreEntry {
  hits: number;
  resetTime: number;
}

const createStore = () => {
  const buckets = new Map<string, StoreEntry>();

  return {
    increment(key: string, windowMs: number, limit: number) {
      const now = Date.now();
      const entry = buckets.get(key);
      if (!entry || entry.resetTime <= now) {
        const next: StoreEntry = { hits: 1, resetTime: now + windowMs };
        buckets.set(key, next);
        return { allowed: true, entry: next };
      }
      if (entry.hits >= limit) {
        return { allowed: false, entry };
      }
      entry.hits += 1;
      return { allowed: true, entry };
    },
    reset(key: string) {
      buckets.delete(key);
    },
  };
};

const store = createStore();

interface Options {
  windowMs?: number;
  max?: number;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

type RateLimitHandler = ((req: any, res: any, next: (err?: any) => void) => void) & {
  resetKey: (key: string) => void;
};

const defaultKey = (req: any) => {
  return (req.ip as string) || req.connection?.remoteAddress || 'global';
};

const setHeaders = (res: any, limit: number, remaining: number, resetTime: number, options: Options) => {
  if (options.standardHeaders) {
    res.setHeader('RateLimit-Limit', limit);
    res.setHeader('RateLimit-Remaining', Math.max(0, remaining));
    res.setHeader('RateLimit-Reset', Math.ceil(resetTime / 1000));
  }
  if (!options.legacyHeaders) {
    return;
  }
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
  res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
};

const rateLimit = (options: Options = {}): RateLimitHandler => {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 5;
  const handler: RateLimitHandler = (req, res, next) => {
    const key = defaultKey(req);
    const { allowed, entry } = store.increment(key, windowMs, max);
    const remaining = allowed ? max - entry.hits : 0;
    setHeaders(res, max, remaining, entry.resetTime, options);
    if (!allowed) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
    next();
  };
  handler.resetKey = (key: string) => {
    store.reset(key);
  };
  return handler;
};

export default rateLimit;
