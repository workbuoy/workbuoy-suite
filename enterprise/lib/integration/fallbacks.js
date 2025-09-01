
// Fallbacks: cached reads & queued writes
import { get, set } from '../perf/cache.js';
import { enqueueRetry } from '../queues/retryQueue.js';
import { getBreaker } from './circuitBreaker.js';

export async function resilientRead(connector, key, fetcher, ttlSec=600){
  const cb = getBreaker(connector);
  if(!cb.canAttempt()){
    const cached = await get(`${connector}:${key}`);
    return { data: cached, stale: true };
  }
  try{
    const data = await fetcher();
    await set(`${connector}:${key}`, data, ttlSec);
    cb.recordSuccess();
    return { data, stale: false };
  }catch(e){
    cb.recordFailure();
    const cached = await get(`${connector}:${key}`);
    if(cached!==undefined) return { data: cached, stale: true };
    throw e;
  }
}

export async function resilientWrite(connector, opType, payload, writer){
  const cb = getBreaker(connector);
  if(!cb.canAttempt()){
    await enqueueRetry(connector, opType, payload);
    return { queued: true };
  }
  try{
    const res = await writer();
    cb.recordSuccess();
    return { ok: true, result: res };
  }catch(e){
    cb.recordFailure();
    await enqueueRetry(connector, opType, payload);
    return { queued: true, error: e?.message };
  }
}
