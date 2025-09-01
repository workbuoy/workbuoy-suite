import { useEffect, useState } from 'react';
import Link from 'next/link';
import PortalLayout from '../../../components/PortalLayout';

type Provider = { id:string, label:string, category?:string, requires_admin?:boolean, status?:string };

const CATS: Record<string,string> = {
  'email':'E-post/Kalender',
  'crm':'CRM',
  'support':'Support',
  'files':'Fil/dokument',
  'hr':'HR',
  'erp':'ERP',
  'it':'Prosess/IT',
  'bi':'BI/Analytics'
};

export default function SelectSystems(){
  const [providers,setProviders] = useState<Provider[]>([]);
  const [sel,setSel] = useState<Record<string, boolean>>({});
  const [loading,setLoading] = useState(true);
  const [msg,setMsg] = useState<string>('');

  useEffect(()=>{
    fetch('/api/integrations/list',{ method:'POST' })
      .then(r=>r.json())
      .then(j=>{
        const plist = (j.data?.providers||[]) as Provider[];
        setProviders(plist);
        const pre:Record<string,boolean> = {};
        plist.forEach(p=>{ if (p.status==='connected') pre[p.id]=true; });
        setSel(pre);
        setLoading(false);
      }).catch(()=> setLoading(false));
  },[]);

  function toggle(id:string){ setSel(s=> ({...s, [id]: !s[id]})); }
  async function connectAll(){
    const ids = Object.keys(sel).filter(k=> sel[k]);
    if (ids.length===0){ setMsg('Velg minst ett system.'); return; }
    setMsg('Starter tilkoblinger…');
    await fetch('/api/integrations/connect-all', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ providers: ids }) });
    setMsg('Tilkoblinger startet. Følg status nedenfor.');
  }

  const byCat: Record<string, Provider[]> = {};
  providers.forEach(p=>{
    const cat = p.category || 'other';
    byCat[cat] = byCat[cat]||[];
    byCat[cat].push(p);
  });

  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold mb-2">Velg systemer</h1>
      <p className="text-gray-700 mb-4">Koble WorkBuoy til verktøyene deres. Du kan koble til enkeltvis – eller trykke <b>Koble til alle</b>.</p>
      {loading ? <div>Henter katalog…</div> : (
        <div className="space-y-8">
          {Object.entries(CATS).map(([key,label])=> (
            <section key={key}>
              <h2 className="font-semibold mb-2">{label}</h2>
              <ul className="grid md:grid-cols-2 gap-3">
                {(byCat[key]||[]).map(p=> (
                  <li key={p.id} className="p-4 rounded-2xl shadow bg-white flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.label}</div>
                      <div className="text-sm text-gray-600">{p.requires_admin? 'Krever IT-godkjenning' : 'Krever vanlig bruker-tilgang'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={"text-xs px-2 py-1 rounded " + (p.status==='connected'?'bg-green-100 text-green-700': p.status==='pending'?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-700')}>
                        {p.status==='connected'?'Koblet': p.status==='pending'?'Venter på IT':'Ikke koblet'}
                      </span>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!sel[p.id]} onChange={()=>toggle(p.id)} />
                        Velg
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="flex items-center gap-3">
            <button onClick={connectAll} className="px-4 py-2 rounded-xl bg-black text-white">Koble til alle</button>
            <Link href="/portal"><a className="underline">Hopp over</a></Link>
          </div>
          {msg && <div className="text-sm text-gray-700">{msg}</div>}
        </div>
      )}
    </PortalLayout>
  );
}
