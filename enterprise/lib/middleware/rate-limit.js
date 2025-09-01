'use strict';
/**
 * Token bucket rate limiter with per-tenant + per-IP scoping.
 * Memory backend by default; optional Redis backend when REDIS_URL is present.
 * Exposes withRateLimit(handler, options).
 */
const crypto = require('crypto');
let Redis;
try { Redis = require('ioredis'); } catch (_) {}

const DEFAULTS = {
  windowMs: 60_000,
  max: 120,            // requests per window
  burst: 60,           // extra tokens allowed as burst
  keyGenerator: (req)=>{
    const tenant = req.headers['x-tenant-id'] || req.headers['x-tenant'] || 'public';
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '0.0.0.0').split(',')[0].trim();
    const user = req.user?.id || req.headers['x-user-id'] || 'anon';
    return `${tenant}:${ip}:${user}`;
  },
  onBlocked: null
};

class MemoryBucket {
  constructor(){ this.state = new Map(); }
  _now(){ return Date.now(); }
  async take(key, {windowMs, max, burst}){
    const now = this._now();
    const rec = this.state.get(key) || { tokens: max + burst, updated: now };
    // Refill proportionally
    const elapsed = now - rec.updated;
    const ratePerMs = max / windowMs;
    rec.tokens = Math.min(max + burst, rec.tokens + elapsed * ratePerMs);
    rec.updated = now;
    if (rec.tokens >= 1){
      rec.tokens -= 1;
      this.state.set(key, rec);
      return { allowed: true, remaining: Math.floor(rec.tokens) };
    }
    return { allowed: false, remaining: Math.floor(rec.tokens) };
  }
}

class RedisBucket {
  constructor(url){
    this.redis = new Redis(url, { lazyConnect: true });
    this.scriptSHA = null;
  }
  async init(){
    const script = `
    local key    = KEYS[1]
    local now    = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local max    = tonumber(ARGV[3])
    local burst  = tonumber(ARGV[4])
    local ttl    = math.ceil(window/1000)
    local data   = redis.call('HMGET', key, 'tokens', 'updated')
    local tokens = tonumber(data[1]) or (max + burst)
    local updated= tonumber(data[2]) or now
    local rate   = max / window
    tokens = math.min(max + burst, tokens + (now - updated) * rate)
    local allowed = 0
    if tokens >= 1 then
      tokens = tokens - 1
      allowed = 1
    end
    redis.call('HMSET', key, 'tokens', tokens, 'updated', now)
    redis.call('EXPIRE', key, ttl)
    return {allowed, math.floor(tokens)}
    `;
    this.scriptSHA = crypto.createHash('sha1').update(script).digest('hex');
    try { await this.redis.script('LOAD', script); } catch {}
    this.script = script;
  }
  async take(key, {windowMs, max, burst}){
    if (!this.redis.status || this.redis.status !== 'ready'){
      try { await this.redis.connect(); } catch {}
      if (!this.scriptSHA) await this.init();
    }
    const now = Date.now();
    const res = await this.redis.eval(this.script, 1, key, now, windowMs, max, burst);
    const allowed = res && res[0] === 1;
    const remaining = res && parseInt(res[1],10) || 0;
    return { allowed, remaining };
  }
}

function createBackend(){
  const url = process.env.REDIS_URL;
  if (url && Redis) return new RedisBucket(url);
  return new MemoryBucket();
}

const backend = createBackend();

function withRateLimit(handler, options={}){
  const cfg = Object.assign({}, DEFAULTS, options);
  return async (req, res) => {
    try {
      const key = cfg.keyGenerator(req);
      const { allowed, remaining } = await backend.take(`rl:${key}`, cfg);
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      if (!allowed){
        if (typeof cfg.onBlocked === 'function') cfg.onBlocked(req, res);
        res.statusCode = 429;
        res.setHeader('Retry-After', String(Math.ceil(cfg.windowMs/1000)));
        return res.end(JSON.stringify({ error: 'rate_limited' }));
      }
      return handler(req, res);
    } catch (err){
      // Fail-open but log a metric
      console.error('[rate-limit] error', err);
      return handler(req, res);
    }
  };
}

module.exports = { withRateLimit };
