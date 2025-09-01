import { useEffect, useState } from 'react';
export default function AdminSLO(){
  const [data,setData] = useState<any>(null);
  useEffect(()=>{ fetch('/api/admin/slo').then(r=>r.json()).then(setData).catch(()=>{}); }, []);
  if (!data) return <div className="p-6">Loading SLO…</div>;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">SLO Overview</h1>
      <section className="p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-2">Failure rate (1h %)</h2>
        <pre className="text-sm bg-gray-50 p-3 rounded">{JSON.stringify(data.failure, null, 2)}</pre>
      </section>
      <section className="p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-2">p95 by connector (5m)</h2>
        <pre className="text-sm bg-gray-50 p-3 rounded">{JSON.stringify(data.p95, null, 2)}</pre>
      </section>
      <section className="p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-2">Sync freshness (age minutes)</h2>
        <pre className="text-sm bg-gray-50 p-3 rounded">{JSON.stringify(data.freshness, null, 2)}</pre>
      </section>
    </div>
  );
}
