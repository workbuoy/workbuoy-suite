import withRateLimit from '../../lib/middleware/rate-limit.js';
import rateLimit from '../../lib/middleware/rate-limit.js';
import { getMetrics } from '../../lib/metrics/registry.js';
const metrics = getMetrics();

/**
 * pages/api/search.js
 * Unified search endpoint over signals FTS.
 * Query params: q (string), sources (csv or array), limit (int)
 * Always returns 200 with [] on error, to be prod-safe.
 */
import { searchSignals } from '../../lib/search.js';
import { logJson } from '../../lib/logger.js';
import rateLimit from '../../lib/middleware/rate-limit.js';
import { getMetrics } from '../../lib/metrics/registry.js';
const metrics = getMetrics();

// Local reservoir to compute p95 for the API handler layer too
const _res = []; const _max=200;
function _obs(ms){
  try{
    _res.push(ms); if(_res.length>_max) _res.shift();
    const s=_res.slice().sort((a,b)=>a-b);
    const idx=Math.max(0, Math.ceil(s.length*0.95)-1);
    metrics.wb_search_latency_p95_ms.set(\1);
  }catch{}
}

const handler = async function handler(req,res){
  const started = Date.now();
  try{
    metrics.wb_search_req_total.inc();

    const breaker = (process.env.WB_FEATURE_SEARCH_BREAKER||'').toLowerCase()==='true';
    if(breaker){ res.status(200).json([]); return; }

    const q = (req.method==='POST' ? (req.body?.q) : (req.query?.q)) || '';
    // sources can be array or csv
    let sources = (req.method==='POST' ? (req.body?.sources) : (req.query?.sources));
    if(typeof sources === 'string') sources = sources.split(',').map(s=>s.trim()).filter(Boolean);
    const limit = parseInt((req.method==='POST' ? req.body?.limit : req.query?.limit) || '50', 10) || 50;

    const results = await searchSignals(q, sources, limit);
    res.status(200).json(Array.isArray(results)?results:[]);
  }catch(e){
    try{ metrics.wb_search_err_total.inc(); }catch{}
    try{ await logJson({ mod:'search', act:'api.err', msg: (e?.message||'err').slice(0,120) }); }catch(_){}
    res.status(200).json([]); // prod-safe: empty list on error
  }finally{
    _obs(Date.now()-started);
  }
}

export default rateLimit({ capacity: 120, refillPerSec: 2 })(handler);

export default withRateLimit(handler);
