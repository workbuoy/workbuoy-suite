import { useEffect, useState } from 'react';
import PortalLayout from '../../components/PortalLayout';

export default function DevPortal(){
  const [keys,setKeys] = useState<any[]>([]);
  const [newKeyName,setNewKeyName] = useState('Integrasjon-nøkkel');
  const [created,setCreated] = useState<any|null>(null);
  useEffect(()=>{ (async()=>{
    const r = await fetch('/api/v1/admin/api-keys', { headers:{ 'x-tenant-id':'demo-tenant' } });
    const j = await r.json(); setKeys(j.items||[]);
  })(); }, []);
  async function createKey(){
    const r = await fetch('/api/v1/admin/api-keys', { method:'POST', headers:{ 'content-type':'application/json', 'x-tenant-id':'demo-tenant' }, body: JSON.stringify({ name:newKeyName }) });
    const j = await r.json(); setCreated(j);
  }
  async function revoke(id:string){
    await fetch(`/api/v1/admin/api-keys/${id}`, { method:'DELETE', headers:{ 'x-tenant-id':'demo-tenant' } });
    location.reload();
  }
  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold mb-4">Developer Portal</h1>
      <div className="bg-white p-4 rounded-2xl shadow mb-6">
        <h2 className="font-semibold mb-2">API-nøkler</h2>
        <div className="flex gap-2 mb-3">
          <input className="border p-2 rounded" value={newKeyName} onChange={e=>setNewKeyName(e.target.value)} />
          <button className="px-3 py-2 bg-blue-600 text-white rounded-xl" onClick={createKey}>Opprett nøkkel</button>
        </div>
        {created && <div className="p-3 bg-yellow-50 rounded border border-yellow-200 mb-4">
          <div className="font-semibold">Kopier nøkkelen nå – vises kun én gang:</div>
          <code className="break-all">{created.secret}</code>
        </div>}
        <table className="min-w-full">
          <thead><tr><th className="p-2 text-left">Navn</th><th className="p-2">Scope</th><th className="p-2">Aktiv</th><th className="p-2">Handling</th></tr></thead>
          <tbody>
            {keys.map((k:any)=>(
              <tr key={k.id} className="border-t">
                <td className="p-2">{k.name}</td>
                <td className="p-2 text-center">{k.scope}</td>
                <td className="p-2 text-center">{k.active?'✅':'—'}</td>
                <td className="p-2 text-center"><button onClick={()=>revoke(k.id)} className="px-3 py-1 bg-red-600 text-white rounded-xl">Trekk tilbake</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="font-semibold mb-2">Snippets</h2>
        <pre className="text-sm bg-gray-50 p-3 rounded">{`// JS/TS fetch
const res = await fetch(process.env.API_BASE_URL + '/api/v1/systems/status', {
  headers: { 'x-api-key': 'PASTE_YOUR_KEY', 'x-tenant-id': 'TENANT' }
});`}</pre>
        <pre className="text-sm bg-gray-50 p-3 rounded mt-3">{`# Python requests
import requests
r = requests.get(f"{API_BASE_URL}/api/v1/systems/status", headers={
  "x-api-key": "PASTE_YOUR_KEY",
  "x-tenant-id": "TENANT"
})`}</pre>
      </div>
    </PortalLayout>
  );
}


      <div className="bg-white p-4 rounded-2xl shadow mt-6">
        <h2 className="font-semibold mb-2">Bruksstatistikk</h2>
        <p className="text-sm text-gray-600">Rate limit plan og siste bruk vises her (forenklet).</p>
        <pre className="text-xs bg-gray-50 p-3 rounded">{JSON.stringify(keys, null, 2)}</pre>
      </div>
