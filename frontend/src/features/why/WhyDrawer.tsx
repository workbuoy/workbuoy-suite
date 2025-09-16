import React, { useState } from 'react';
import { Drawer } from "@/components/ui/drawer";
import { apiFetch } from "@/api/client";

export function WhyDrawer({ targetId }:{targetId:string}) {
  const [entries, setEntries] = useState<any[]>([]);

  async function load() {
    if (!targetId) return;
    const res = await apiFetch(`/api/audit?id=${targetId}`);
    setEntries(res);
  }

  return (
    <Drawer open={!!targetId} onOpenChange={()=>{}}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Audit trail for {targetId}</h2>
        <button onClick={load}>Load</button>
        <ul>
          {entries.map(e=>(<li key={e.id}>{e.action} at {e.ts}</li>))}
        </ul>
      </div>
    </Drawer>
  );
}
