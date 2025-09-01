import Redis from 'ioredis';
import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const redisUrl = process.env.REDIS_URL || null;
const redis = redisUrl ? new Redis(redisUrl) : null;

/** token bucket per-tenant */
export async function allow({ tenant_id }){
  const { rpm, burst } = await getPlan(tenant_id);
  if(redis){
    const key = `rl:${tenant_id}`;
    const now = Date.now();
    const refill = Math.ceil(rpm/60); // tokens per second
    const multi = redis.multi();
    multi.hsetnx(key, 'tokens', burst);
    multi.hsetnx(key, 'ts', now);
    const res = await multi.exec();
    const m = await redis.hgetall(key);
    let tokens = parseFloat(m.tokens||burst);
    const last = parseFloat(m.ts||now);
    const elapsed = Math.max(0, Math.floor((now - last)/1000));
    tokens = Math.min(burst, tokens + elapsed*refill);
    if(tokens >= 1){
      tokens -= 1;
      await redis.hmset(key, { tokens: tokens, ts: now });
      return { allowed:true, remaining: Math.floor(tokens) };
    }else{
      await redis.hmset(key, { tokens: tokens, ts: now });
      return { allowed:false, remaining: 0 };
    }
  }else{
    // fallback in-memory naive (process local)
    global.__WB_RL = global.__WB_RL || new Map();
    const k = tenant_id||'global';
    const now = Date.now();
    const s = global.__WB_RL.get(k) || { tokens: burst, ts: now };
    const refill = rpm/60/1000; // tokens per ms
    const elapsed = now - s.ts;
    s.tokens = Math.min(burst, s.tokens + elapsed*refill);
    s.ts = now;
    if(s.tokens >= 1){
      s.tokens -= 1; global.__WB_RL.set(k, s);
      return { allowed:true, remaining: Math.floor(s.tokens) };
    }else{
      global.__WB_RL.set(k, s);
      return { allowed:false, remaining: 0 };
    }
  }
}

async function getPlan(tenant_id){
  const db = new sqlite3.Database(DB_PATH);
  return await new Promise((res)=> db.get(`SELECT rpm, burst FROM tenant_plan_limits WHERE tenant_id=?`, [tenant_id], (e,row)=>{
    if(e || !row) return res({ rpm: 120, burst: 60 });
    res({ rpm: row.rpm||120, burst: row.burst||60 });
  }));
}
