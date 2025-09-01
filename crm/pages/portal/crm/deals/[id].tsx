import React from 'react';
import type { GetServerSideProps } from 'next';
import { prisma } from '../../../../lib/db';
import { isCrmEnabled } from '../../../../lib/feature';

export const getServerSideProps: GetServerSideProps<any> = async (ctx) => {
  if (!isCrmEnabled()) return { notFound: true } as any;
  const id = String(ctx.params?.id);
  const deal = await prisma.deal.findUnique({ where: { id }, include: { company: true, tasks: true } });
  if (!deal) return { notFound: true };
  return { props: { deal: JSON.parse(JSON.stringify(deal)) } };
};

export default function DealPage({ deal }: any){
  return (
    <div className="p-6">
      <a href="/portal/crm/deals" className="text-sm underline">← Til pipeline</a>
      <h1 className="text-2xl font-bold mt-2">{deal.name}</h1>
      <div className="opacity-70 mb-4">{deal.stage} · {deal.amount ?? ''}</div>
      {deal.company && <div className="mb-4">Company: <a className="underline" href={`/portal/crm/companies/${deal.company.id}`}>{deal.company.name}</a></div>}
      <Tasks dealId={deal.id} initial={deal.tasks || []} />
      <div className="rounded-xl border p-4">
        <div className="font-semibold mb-2">Next steps (stub)</div>
        <ul className="list-disc pl-6 text-sm">
          <li>Send oppsummeringsmail</li>
          <li>Foreslå demo</li>
          <li>Bekreft timeline</li>
        </ul>
      </div>
          </div>
  );
}

function Tasks({ dealId, initial }: any){
  const [tasks, setTasks] = React.useState(initial);
  const [title, setTitle] = React.useState('Ring kunden');
  async function createTask(){
    const res = await fetch('/api/tasks', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, dealId }) });
    const t = await res.json(); setTasks([t, ...tasks]); setTitle('');
  }
  async function toggle(id: string, status: string){
    const res = await fetch('/api/tasks/'+id, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: status==='open'?'done':'open' }) });
    const up = await res.json(); setTasks(tasks.map((x:any)=>x.id===id? up : x));
  }
  return (
    <div className="rounded-xl border p-4 mt-4">
      <div className="font-semibold mb-2">Tasks</div>
      <div className="flex gap-2 mb-3">
        <input className="border rounded px-2 py-1 flex-1" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ny task..." />
        <button className="border rounded px-3 py-1" onClick={createTask}>Legg til</button>
      </div>
      {tasks.length===0? <div className="text-sm opacity-60">Ingen tasks</div>:
        <ul className="text-sm">
          {tasks.map((t:any)=>(
            <li key={t.id} className="flex items-center gap-2 py-1">
              <button className="border rounded px-2 py-0.5 text-xs" onClick={()=>toggle(t.id, t.status)}>{t.status==='open'?'✓':'↺'}</button>
              <span className={t.status==='done'?'line-through opacity-60':''}>{t.title}</span>
            </li>
          ))}
        </ul>
      }
    </div>
  );
}

