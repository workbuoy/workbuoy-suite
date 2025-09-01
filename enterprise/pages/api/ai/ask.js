import registry, { wb_ai_req_total, wb_ai_err_total, wb_search_null_total } from '../../../lib/metrics/registry.js';

export default async function handler(req, res){
  if(req.method !== 'POST'){ return res.status(405).end(); }
  const { q, tenant } = req.body || {};
  try {
    const mode = q?.startsWith('/kart') ? 'kart' : q?.startsWith('/søk') || q?.startsWith('/sok') ? 'søk' : q?.startsWith('/export') ? 'export' : 'hjelp';
    wb_ai_req_total.inc({mode}, 1);

    if(mode==='export'){
      const url = `/api/search/export?q=${encodeURIComponent(q || '')}`;
      return res.status(200).json({ url, params: { q } });
    }

    if(mode==='hjelp'){
      return res.status(200).json({ results: [], help: ['/søk <spørring>','/kart <spørring>','/export <spørring>','/hjelp'] });
    }

    // Delegate to existing search
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/search/query`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ q })
    }).then(r=>r.ok ? r.json() : {results:[]}).catch(()=>({results:[]}));

    const results = r.results || [];
    if(results.length===0){
      wb_search_null_total.inc({tenant: tenant || 'default'}, 1);
    }

    if(mode==='kart'){
      // pass through, map page will place markers
      return res.status(200).json({ results });
    }
    if(mode==='søk'){
      return res.status(200).json({ results });
    }
    return res.status(200).json({ results });
  } catch (e){
    wb_ai_err_total.inc({reason: e?.name || 'error'}, 1);
    return res.status(500).json({ error: 'internal_error' });
  }
}
