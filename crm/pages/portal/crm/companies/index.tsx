import React from 'react';
import type { GetServerSideProps } from 'next';
import { prisma } from '../../../../lib/db';
import { isCrmEnabled } from '../../../../lib/feature';

export const getServerSideProps: GetServerSideProps<any> = async () => {
  if (!isCrmEnabled()) return { notFound: true } as any;
  const companies = await prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  return { props: { companies: JSON.parse(JSON.stringify(companies)) } };
};

import AppShell from '../../../components/AppShell';

export default function Companies({ companies }: any){
  return (<AppShell title="Selskaper" subtitle="Oversikt over kunder og prospekter">
      <h1 className="text-2xl font-bold">Companies</h1>
      <div className="wb-card"><table className="wb-table" className="w-full text-sm mt-3">
        <thead><tr className="text-left border-b"><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Domain</th></tr></thead>
        <tbody>{companies.map((c:any)=>(
          <tr key={c.id} className="border-b last:border-0">
            <td className="py-2 pr-4"><a className="underline" href={`/portal/crm/companies/${c.id}`}>{c.name}</a></td>
            <td className="py-2 pr-4">{c.domain ?? ''}</td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
