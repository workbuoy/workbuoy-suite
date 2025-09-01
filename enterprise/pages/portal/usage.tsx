import { useEffect, useState } from 'react';

export default function UsageTile(){
  const [data, setData] = useState<any>(null);
  useEffect(()=>{ fetch('/api/usage/summary').then(r=>r.json()).then(setData).catch(()=>{}); }, []);
  if (!data) return <div className="p-4 rounded-2xl shadow">Loading usage…</div>;
  const total = (data.usage||[]).reduce((a:any,x:any)=> a + (x.used||0), 0);
  const limit = data.quotas?.limit_monthly_events || 0;
  const pct = limit ? Math.round((total/limit)*100) : 0;
  let colorClass = 'bg-blue-600';
  if (pct >= 100) colorClass='bg-red-600';
  else if (pct >= 80) colorClass='bg-yellow-500';
  return (
    <div className="p-6 rounded-2xl shadow bg-white">
      <h2 className="text-xl font-semibold mb-2">This month usage vs limits</h2>
      <div>Tenant: {data.tenant}</div>
      <div className="mt-2">Events used: <b>{total}</b> / {limit}</div>
      <div className="w-full bg-gray-200 h-2 rounded mt-2">
        <div className={`${colorClass} h-2 rounded`} style={{ width: `${Math.min(100,pct)}%` }} />
      </div>
      <div className="text-sm mt-1">{pct}% of monthly events</div>
    </div>
  );
}
