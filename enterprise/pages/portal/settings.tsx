import React, { useEffect, useState } from 'react';

export default function SettingsPage(){
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  async function load(){
    setLoading(true);
    const res = await fetch('/api/wb2wb/policy.get', { headers: { 'x-tenant-id': 'default' } });
    const js = await res.json();
    setEnabled(!!js?.settings?.wb2wb_enabled);
    setLoading(false);
  }
  async function save(v:boolean){
    setEnabled(v);
    await fetch('/api/wb2wb/policy.update', {
      method:'POST',
      headers:{ 'content-type':'application/json','x-tenant-id':'default' },
      body: JSON.stringify({ wb2wb_enabled: v })
    });
  }
  useEffect(()=>{ load(); },[]);
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Innstillinger</h1>
      <div className="border rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium">La Buoy gjenkjenne andre Buoy</div>
            <p className="text-sm text-gray-600 mt-1">
              Når du samhandler med en partner som også bruker WorkBuoy, kan systemet automatisk forenkle dataflyten.
              Dette skjer kun med partnere du allerede jobber med, og bare nødvendig informasjon (ordrestatus, leveringsavvik) deles.
              Ingen priser, marginer eller andre kundedetaljer deles. Alt logges sikkert.
            </p>
          </div>
          <button
            onClick={()=>save(!enabled)}
            className={"px-4 py-2 rounded-lg border " + (enabled ? "bg-green-600 text-white" : "bg-white")}
            disabled={loading}
            aria-pressed={enabled}
          >
            {enabled ? "På" : "Av"}
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-500 mt-4">
        Endringen lagres automatisk i din bedrift sin profil.
      </div>
    </div>
  );
}
