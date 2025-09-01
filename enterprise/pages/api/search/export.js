export default async function handler(req, res){
  if(req.method !== 'POST'){ return res.status(405).end(); }
  const { q, filter, limit } = (req.body && Object.keys(req.body).length ? req.body : Object.fromEntries(new URLSearchParams(req.url.split('?')[1]||'')));
  const searchRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/search/query`, {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ q, filter, limit })
  }).then(r=>r.ok?r.json():{results:[]}).catch(()=>({results:[]}));
  const results = searchRes.results || [];
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="export.csv"');
  const header = 'id,type,title,source,timestamp,url\n';
  const rows = results.map((r)=>[r.id, r.type, r.title, r.source, r.timestamp||'', r.url||'']
    .map(v=>String(v||'').replace(/"/g,'""')).map(v=>`"${v}"`).join(',')).join('\n');
  res.status(200).send(header+rows);
}
