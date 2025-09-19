import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import { apiFetch } from "@/api";

export function DealsPanel() {
  const [deals, setDeals] = useState<any[]>([]);

  async function load() {
    const res = await apiFetch<any[]>('/api/deals');
    setDeals(res);
  }
  useEffect(()=>{ load(); }, []);

  async function updateStatus(id:string, status:string) {
    await apiFetch('/api/deals', { method:'POST', body: JSON.stringify({ id, status }) });
    load();
  }

  return (
    <Card className="m-2">
      <CardContent>
        <h2 className="text-xl font-bold mb-2">Deals</h2>
        <table className="w-full">
          <thead><tr><th>ID</th><th>Contact</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>
            {deals.map(d=>(
              <tr key={d.id}>
                <td>{d.id}</td><td>{d.contactId}</td><td>{d.value}</td>
                <td>
                  <Select value={d.status} onValueChange={(s)=>updateStatus(d.id,s)}>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
