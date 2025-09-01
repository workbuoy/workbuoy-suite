import { useEffect, useState } from 'react';
import PortalLayout from '../../components/PortalLayout';
export default function Webhooks(){
  const [endpoints,setEndpoints]=useState<any[]>([]);
  const [deliveries,setDeliveries]=useState<any[]>([]);
  const [url,setUrl]=useState('https://example.org/webhook');
  const [events,setEvents]=useState('["connector.sync.completed"]');
  useEffect(()=>{ (async()=>{
    const r = await fetch('/api/v1/webhooks/endpoints', { headers:{ 'x-tenant-id':'demo-tenant' } });
    const j = await r.json(); setEndpoints(j.items||[]);
    const d = await fetch('/api/v1/webhooks/deliveries', { headers:{ 'x-tenant-id':'demo-tenant' } });
    setDeliveries((await d.json()).items||[]);
  })(); }, []);
  async function createEp(){
    const r = await fetch('/api/v1/webhooks/endpoints', { method:'POST', headers:{ 'content-type':'application/json','x-tenant-id':'demo-tenant' }, body: JSON.stringify({ url, events: JSON.parse(events) })});
    const j = await r.json(); alert('Secret (vises kun én gang): '+j.secret); location.reload();
  }
  async function retry(id:string){
    await fetch('/api/v1/webhooks/retry', { method:'POST', headers:{ 'content-type':'application/json','x-tenant-id':'demo-tenant' }, body: JSON.stringify({ id })});
    location.reload();
  }
  return (<PortalLayout>
    <h1 className="text-2xl font-bold mb-4">Webhooks</h1>
    <div className="bg-white p-4 rounded-2xl shadow mb-6">
      <h2 className="font-semibold mb-2">Opprett endpoint</h2>
      <div className="flex gap-2 mb-2">
        <input className="border p-2 rounded w-1/2" placeholder="URL" value={url} onChange={e=>setUrl(e.target.value)} />
        <input className="border p-2 rounded w-1/2" placeholder='["event"]' value={events} onChange={e=>setEvents(e.target.value)} />
        <button className="px-3 py-2 bg-blue-600 text-white rounded-xl" onClick={createEp}>Opprett</button>
      </div>
      <ul className="list-disc ml-6">{endpoints.map(e=><li key={e.id} className="mb-1">{e.url} – {e.events?.join(", ")}</li>)}</ul>
    </div>
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-2">Leveransehistorikk</h2>
      <table className="min-w-full">
        <thead><tr><th className="p-2">ID</th><th className="p-2">Endpoint</th><th className="p-2">Event</th><th className="p-2">Status</th><th className="p-2">Forsøk</th><th className="p-2">Handling</th></tr></thead>
        <tbody>{deliveries.map((d:any)=>(<tr key={d.id} className="border-t"><td className="p-2">{d.id}</td><td className="p-2">{d.endpoint_id}</td><td className="p-2">{d.event}</td><td className="p-2">{d.status}</td><td className="p-2">{d.attempts}</td><td className="p-2"><button onClick={()=>retry(d.id)} className="px-3 py-1 bg-teal-600 text-white rounded-xl">Retry</button></td></tr>))}</tbody>
      </table>
    </div>
  </PortalLayout>);
}
