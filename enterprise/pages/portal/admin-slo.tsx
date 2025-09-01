import { useEffect, useState } from 'react';

export default function AdminSLO(){
  const [metrics,setMetrics] = useState<string>('Loading...');
  useEffect(()=>{ fetch('/api/metrics').then(r=>r.text()).then(setMetrics).catch(()=>{}); },[]);
  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-4">SLO / Metrics Snapshot</h1>
      <pre className="text-xs whitespace-pre-wrap">{metrics}</pre>
    </div>
  );
}
