import React from 'react';
import type { GetServerSideProps } from 'next';
import { prisma } from '../../../lib/db';
import { isCrmEnabled } from '../../../lib/feature';

type Deal = { id: string; name: string; amount: string | null; stage: string | null; companyId?: string | null };

export const getServerSideProps: GetServerSideProps<{ stages: Record<string, Deal[]> }> = async () => {
  if (!isCrmEnabled()) return { notFound: true } as any;
  const deals = await prisma.deal.findMany({ orderBy: { createdAt: 'desc' } });
  const buckets: Record<string, Deal[]> = {};
  const stages = ['Lead','Qualification','Proposal','Negotiation','Won','Lost'];
  stages.forEach(s=> buckets[s] = []);
  deals.forEach(d => { const s = (d.stage as string) || 'Lead'; (buckets[s] = buckets[s] || []).push(d as any); });
  return { props: { stages: buckets } };
};

import AppShell from '../../../components/AppShell';

export default function DealsBoard({ stages }: { stages: Record<string, Deal[]> }){
  const order = Object.keys(stages);
  return (<AppShell title="Pipeline" subtitle="Dra-og-slipp mellom steg – sanntid via webhooks/SSE">
      <h1 className="text-2xl font-bold mb-2">Pipeline (Kanban)</h1>
      <p className="opacity-70 mb-4">Dra-og-slipp kommer senere. Sortert etter stage.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {order.map(stage => (
          <div key={stage} className="rounded-xl border p-3 shadow-sm" onDragOver={(e)=>e.preventDefault()} onDrop={async (e)=>{ const id=e.dataTransfer.getData("dealId"); if(!id) return; await fetch(`/api/deals/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ stage }) }); window.location.reload(); }}>
            <div className="font-semibold mb-2">{stage}</div>
            {stages[stage].length === 0 ? <div className="text-sm opacity-60">Ingen</div> :
              stages[stage].map(d => (
                <a key={d.id} href={`/portal/crm/deals/${d.id}`} className="block border rounded-lg p-2 mb-2 hover:bg-gray-50" draggable onDragStart={(e)=>{ e.dataTransfer.setData("dealId", String(d.id)); }} data-testid={`deal-${stage}-${String(d.id)}` }>
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="text-xs opacity-70">{d.amount ?? ''}</div>
                </a>
              ))
            }
          </div>
        ))}
      </div>
    </div>
  );
}
