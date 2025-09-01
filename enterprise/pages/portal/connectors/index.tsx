import { useEffect, useState } from 'react';
import Link from 'next/link';
import PortalLayout from '../../components/PortalLayout';

type Provider = { id:string, label:string, category?:string, requires_admin?:boolean, status?:string };

export default function Catalog(){
  const [providers,setProviders] = useState<Provider[]>([]);
  const [loading,setLoading] = useState(true);
  const [msg,setMsg] = useState<string>('');
  useEffect(()=>{
    fetch('/api/integrations/list',{ method:'POST' }).then(r=>r.json()).then(j=>{
      setProviders(j.data?.providers||[]); setLoading(false);
    }).catch(()=> setLoading(false));
  },[]);

  async function connect(id:string){
    setMsg('');
    const r = await fetch('/api/integrations/connect', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider:id }) });
    const j = await r.json();
    setMsg(j.ok? 'Startet tilkobling' : 'Feil: '+(j.error||'ukjent'));
  }
  function badge(s?:string){
    return <span className={'text-xs px-2 py-1 rounded ' + (s==='connected'?'bg-green-100 text-green-700': s==='pending'?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-700')}>{s==='connected'?'Koblet': s==='pending'?'Venter på IT':'Ikke koblet'}</span>;
  }

  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold mb-2">Integrasjoner</h1>
      <p className="text-gray-700 mb-4">Koble WorkBuoy til verktøyene dere bruker. <Link href="/portal/onboarding/admin-consent"><a className="underline">IT-godkjenning</a></Link> kan være nødvendig for enkelte systemer.</p>
      {loading ? <div>Henter…</div> : (
        <ul className="space-y-3">
          {providers.map(p=> (
            <li key={p.id} className="p-4 rounded-2xl shadow bg-white flex items-center justify-between">
              <div>
                <div className="font-medium">{p.label} {p.requires_admin && <span className="text-xs ml-2 px-2 py-1 rounded bg-blue-50 text-blue-700">Krever IT?</span>}</div>
                <div className="text-sm text-gray-600">Hva betyr dette? — WorkBuoy leser kun nødvendige data for å gi deg oversikt og søk. Ingen endringer gjøres uten bekreftelse.</div>
              </div>
              <div className="flex items-center gap-3">
                {badge(p.status)}
                <button onClick={()=>connect(p.id)} className="px-3 py-2 rounded-xl bg-black text-white">Connect</button>
                {/* Disconnect could be added later; audit-log recommended */}
              </div>
            </li>
          ))}
        </ul>
      )}
      {msg && <div className="mt-3 text-sm">{msg}</div>}
    </PortalLayout>
  );
}
