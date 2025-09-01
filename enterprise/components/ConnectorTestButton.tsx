import { useState } from 'react';
export default function ConnectorTestButton({ connector, secretRef, jiraBaseUrl }:{connector:string,secretRef:string,jiraBaseUrl?:string}){
  const [res,setRes] = useState<any>(null);
  const onClick=()=>{
    fetch('/api/connectors/test-secret',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({connector,secretRef,jiraBaseUrl})})
      .then(r=>r.json()).then(setRes).catch(()=>setRes({ok:false}));
  };
  return (
    <div className="mt-2">
      <button onClick={onClick} className="px-3 py-1 bg-blue-600 text-white rounded">Test Connector</button>
      {res && <div className="mt-1 text-sm">{res.ok ? 'Reachable ✅' : 'Unreachable ❌'}</div>}
    </div>
  );
}
