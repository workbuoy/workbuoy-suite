import { useEffect, useState } from 'react';

const HELP = "Kobling betyr at WorkBuoy kan hente data herfra.";

export default function Connectors(){
  const [items,setItems]=useState([]); const [err,setErr]=useState(null);
  const jwt = (typeof window!=='undefined') ? window.localStorage.getItem('wb_jwt') : '';

  async function load(){
    try{
      const res = await fetch('/api/portal/connectors', { headers: { authorization: jwt?`Bearer ${jwt}`:'' } });
      const j = await res.json(); setItems(j.connectors||[]);
    }catch(e){ setErr('Kunne ikke laste koblinger'); }
  }
  useEffect(()=>{ load(); },[]);

  async function toggle(provider, enabled){
    const action = enabled?'disable':'enable';
    const body = action==='enable' ? { provider, action, secrets: { api_key: 'stub' } } : { provider, action };
    const res = await fetch('/api/portal/connectors', { method:'POST', headers:{ 'content-type':'application/json', authorization: jwt?`Bearer ${jwt}`:'' }, body: JSON.stringify(body) });
    if(res.ok) load(); else alert('Kunne ikke endre kobling');
  }
  async function sync(provider){
    const res = await fetch('/api/portal/connectors/sync', { method:'POST', headers:{ 'content-type':'application/json', authorization: jwt?`Bearer ${jwt}`:'' }, body: JSON.stringify({provider}) });
    if(res.ok) load(); else alert('Sync feilet');
  }

  if(err) return <div className="p-4 text-red-600">{err}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Koblinger</h1>
      <div className="text-sm text-gray-600" title={HELP}>Hva er dette?</div>
      <ul className="space-y-2">
        {items.map(it=>(
          <li key={it.provider} className="flex items-center justify-between border rounded p-3">
            <div className="flex items-center gap-3">
              <span className={it.status==='connected'?'text-green-600':'text-amber-600'}>●</span>
              <div>
                <div className="font-medium">{it.name} <span className="text-xs text-gray-500">({it.provider})</span></div>
                <div className="text-xs text-gray-500">Status: {it.status||'pending'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>sync(it.provider)} className="text-sm underline">Sync</button>
              <button onClick={()=>toggle(it.provider,it.enabled)} className="px-2 py-1 text-sm border rounded">{it.enabled?'Deaktiver':'Aktiver'}</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="text-sm text-gray-600 pt-4">Koble senere? Ingen problem – vi viser demo-data i dashboardet så lenge.</div>
    </div>
  );
}
