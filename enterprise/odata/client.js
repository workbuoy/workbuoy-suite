import fetch from 'node-fetch';

function enc(s){ return encodeURIComponent(s); }
function buildUrl(baseUrl, path, params={}){
  const qs = Object.entries(params).filter(([_,v])=>v!==undefined && v!==null && v!=='')
    .map(([k,v])=> `${enc(k)}=${enc(v)}`).join('&');
  const sep = path.includes('?') ? '&' : '?';
  return `${baseUrl.replace(/\/$/,'')}/${path}${qs ? sep+qs : ''}`;
}

async function _doFetch(url, headers, retries=3, backoff=500){
  for(let i=0;i<retries;i++){
    try{
      const controller = new AbortController();
      const t = setTimeout(()=>controller.abort(), 15000);
      const r = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(t);
      if(r.status===429 || r.status>=500){
        if(i<retries-1){ await new Promise(res=>setTimeout(res, backoff*Math.pow(2,i))); continue; }
      }
      if(!r.ok){ throw new Error(`HTTP ${r.status}`); }
      const j = await r.json();
      return j?.d?.results || j?.value || j;
    }catch(e){
      if(i===retries-1) throw e;
      await new Promise(res=>setTimeout(res, backoff*Math.pow(2,i)));
    }
  }
  return [];
}

export async function odataGet({ baseUrl, path, params={}, auth }){
  const url = buildUrl(baseUrl, path, { $format:'json', **params });
  const headers = { Accept:'application/json' };
  if(auth?.type==='basic'){ headers.Authorization = 'Basic '+Buffer.from(`${auth.username}:${auth.password}`).toString('base64'); }
  else if(auth?.type==='bearer'){ headers.Authorization = 'Bearer '+auth.token; }
  return await _doFetch(url, headers);
}

export async function odataGetPaged({ baseUrl, path, params={}, auth, pageSize=100, maxPages=10 }){
  let results=[], pageCount=0;
  for(let i=0;i<maxPages;i++){
    const skip = i*pageSize;
    const page = await odataGet({ baseUrl, path, params:{...params, "$skip":skip, "$top":pageSize}, auth });
    if(!page || !page.length) break;
    results.push(...page);
    pageCount++;
    if(page.length<pageSize) break;
  }
  return { results, pageCount };
}

export default { odataGet, odataGetPaged };
