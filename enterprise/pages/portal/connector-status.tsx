import { useEffect, useState } from 'react';

export default function ConnectorStatus(){
  const [data,setData] = useState<any>(null);
  useEffect(()=>{ fetch('/api/connectors/status').then(r=>r.json()).then(setData).catch(()=>{}); },[]);
  if (!data) return <div className="p-6">Loading…</div>;
  const lastCount: Record<string, number> = {};
  (data.recentSyncs||[]).forEach((x:any)=>{ if (!lastCount[x.connector]) lastCount[x.connector] = parseInt(x.count||'0',10)||0; });
  const lastError: Record<string, string> = {};
  (data.recentErrors||[]).forEach((x:any)=>{ if (!lastError[x.connector]) lastError[x.connector] = x.error; });
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Connector status</h1>
      <table className="min-w-full bg-white rounded-2xl overflow-hidden">
        <thead><tr className="bg-gray-100"><th className="px-4 py-2 text-left">Connector</th><th className="px-4 py-2">Last since</th><th className="px-4 py-2">Last count</th><th className="px-4 py-2">Last error</th></tr></thead>
        <tbody>
          {(data.state||[]).map((s:any, idx:number)=> (
            <tr key={idx} className="border-t">
              <td className="px-4 py-2">{s.connector}</td>
              <td className="px-4 py-2">{typeof s.since==='number'? new Date(s.since).toISOString() : String(s.since)}</td>
              <td className="px-4 py-2">{lastCount[s.connector] ?? '-'}</td>
              <td className="px-4 py-2">{lastError[s.connector] ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
