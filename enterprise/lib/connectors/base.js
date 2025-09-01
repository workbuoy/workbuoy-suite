import fetch from 'node-fetch';

/** Exponential backoff with jitter */
export async function withRetry(fn, { retries=5, baseMs=300 } = {}){
  let attempt = 0, lastErr;
  while(attempt <= retries){
    try{ return await fn(); }
    catch(e){
      lastErr = e;
      const status = e.status || e.code || 0;
      // Retry on 429/5xx
      if(!(status===429 || (status>=500 && status<600))){ throw e; }
      const delay = Math.round((baseMs * Math.pow(2, attempt)) * (0.8 + Math.random()*0.4));
      await new Promise(r=>setTimeout(r, delay));
      attempt++;
    }
  }
  throw lastErr;
}

/** Standard incremental sync harness */
export async function withIncrementalSync({ tenant, name, sinceKey='since', cursorKey='cursor', fetchPage, pushItems, getState, setState }){
  const since = (await getState(tenant, name, sinceKey)) || null;
  let cursor = (await getState(tenant, name, cursorKey)) || null;
  let total = 0, nextSince = since, nextCursor = cursor;
  while(true){
    const page = await fetchPage({ since: nextSince, cursor: nextCursor });
    const items = page.items || [];
    if(items.length){
      await pushItems(items);
      total += items.length;
    }
    if(page.nextCursor){ nextCursor = page.nextCursor; await setState(tenant, name, nextCursor, cursorKey); }
    if(page.nextSince){ nextSince = page.nextSince; await setState(tenant, name, nextSince, sinceKey); }
    if(!page.hasMore) break;
  }
  return { ok:true, total, since: nextSince, cursor: nextCursor };
}
