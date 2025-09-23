import React, { useState } from 'react';
import { Drawer } from "@/components/ui/drawer";
import { apiFetch } from "@/api";

export function WhyDrawer({ targetId }:{targetId:string}) {
  const [entries, setEntries] = useState<any[]>([]);

  async function load() {
    if (!targetId) return;
    const res = await apiFetch<{ log: any[] }>(`/api/audit?id=${targetId}`);
    setEntries(res.log || []);
  }

  return (
    <Drawer open={!!targetId} onOpenChange={()=>{}}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Audit trail for {targetId}</h2>
        <button onClick={load}>Load</button>
        <ul>
          {entries.map(e=>(<li key={e.id}>{e.method} {e.route} at {e.ts}</li>))}
        </ul>
      </div>
    </Drawer>
  );
}
