import { useEffect, useState } from 'react';

export default function Dashboard(){
  const [data,setData]=useState(null); const [demo,setDemo]=useState(false);
  const jwt = (typeof window!=='undefined') ? window.localStorage.getItem('wb_jwt') : '';

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch('/api/portal/connectors', { headers:{ authorization: jwt?`Bearer ${jwt}`:'' } });
        const j = await res.json(); const active = (j.connectors||[]).some(x=>x.enabled);
        if(!active){
          setDemo(true);
          setData({ eventsToday: 42, alerts: 1, notes: 5 });
        } else {
          // In real env, fetch real metrics; placeholder numbers
          setData({ eventsToday: 7, alerts: 0, notes: 2 });
        }
      }catch{ setDemo(true); setData({ eventsToday: 13, alerts: 0, notes: 1 }); }
    }
    load();
  },[]);

  if(!data) return <div className="p-4">Laster...</div>;
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {demo && <div className="text-amber-700">Demo-data: Vi viser et lite seed-sett inntil du kobler til en datakilde.</div>}
      <div>Dagens hendelser: <b>{data.eventsToday}</b></div>
      <div>Aktive varsler: <b>{data.alerts}</b></div>
      <div>Notater: <b>{data.notes}</b></div>
    </div>
  );
}
