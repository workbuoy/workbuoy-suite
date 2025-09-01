import React from 'react';
import type { GetServerSideProps } from 'next';
import { prisma } from '../../../../lib/db';
import { isCrmEnabled } from '../../../../lib/feature';

export const getServerSideProps: GetServerSideProps<any> = async (ctx) => {
  if (!isCrmEnabled()) return { notFound: true } as any;
  const id = String(ctx.params?.id);
  const company = await prisma.company.findUnique({
    where: { id },
    include: { contacts: true, deals: true, tickets: true }
  });
  if (!company) return { notFound: true };
  return { props: { company: JSON.parse(JSON.stringify(company)) } };
};

export default function CompanyPage({ company }: any){
  return (
    <div className="p-6">
      <a href="/portal/crm/companies" className="text-sm underline">← Til Companies</a>
      <h1 className="text-2xl font-bold mt-2">{company.name}</h1>
      <div className="opacity-70 mb-4">{company.domain ?? ''}</div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4"><h3 className="font-semibold mb-2">Contacts</h3>
          {company.contacts.length===0? <div className="text-sm opacity-60">Ingen</div>:
          <ul className="text-sm">{company.contacts.map((x:any)=>(<li key={x.id}>{x.name} · {x.email ?? ''}</li>))}</ul>}
        </div>
        <div className="rounded-xl border p-4"><h3 className="font-semibold mb-2">Deals</h3>
          {company.deals.length===0? <div className="text-sm opacity-60">Ingen</div>:
          <ul className="text-sm">{company.deals.map((x:any)=>(<li key={x.id}><a className="underline" href={`/portal/crm/deals/${x.id}`}>{x.name}</a> · {x.stage ?? ''}</li>))}</ul>}
        </div>
        <div className="rounded-xl border p-4"><h3 className="font-semibold mb-2">Tickets</h3>
          {company.tickets.length===0? <div className="text-sm opacity-60">Ingen</div>:
          <ul className="text-sm">{company.tickets.map((x:any)=>(<li key={x.id}>{x.subject} · {x.status ?? ''}</li>))}</ul>}
        </div>
      </div>
    </div>
  );
}
