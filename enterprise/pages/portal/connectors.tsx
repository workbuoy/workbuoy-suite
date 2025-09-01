import { useEffect, useState } from 'react';

const ALL = ['Infor M3','NetSuite','Jira','Zoom','Google Drive','BambooHR','Qlik Sense','SharePoint','Workday','ServiceNow','Oracle Fusion ERP','Adobe Experience','IFS ERP'];

export default function ConnectorsAdmin(){
  const [flags,setFlags] = useState<any>({});
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
    fetch('/api/connectors/flags').then(r=>r.json()).then(j=>{
      const f:any = {}; (j.flags||[]).forEach((x:any)=> f[x.connector]=x.enabled);
      setFlags(f); setLoading(false);
    }).catch(()=> setLoading(false));
  },[]);
  async function toggle(name:string){
    const next = !flags[name];
    setFlags({...flags,[name]: next});
    await fetch('/api/connectors/flags',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({connector:name, enabled: next}) });
  }
  if (loading) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Connectors</h1>
      <p className="text-sm text-gray-600">Toggle which connectors are enabled for this tenant.</p>
      <ul className="grid md:grid-cols-2 gap-3">
        {ALL.map(n=>(
          <li key={n} className="p-4 rounded-2xl shadow flex items-center justify-between bg-white">
            <span>{n}</span>
            <button onClick={()=>toggle(n)} className={"px-3 py-1 rounded " + (flags[n] ? "bg-green-600 text-white" : "bg-gray-300")}>{flags[n] ? "Enabled" : "Disabled"}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
