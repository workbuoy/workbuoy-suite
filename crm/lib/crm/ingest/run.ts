import client from 'prom-client';
import { prisma } from '../../db';
import type { IngestSource, IngestEvent } from './types';

function counter(){
  const name='wb_crm_ingest_events_total';
  const existing = client.register.getSingleMetric(name);
  if (existing) return existing;
  return new client.Counter({ name, help:'Ingest events processed', labelNames:['source','kind'], registers:[client.register] });
}

async function handleEvent(ev: IngestEvent){
  const c = counter();
  c.labels(ev.source, ev.kind).inc(1);
  if (ev.kind === 'contact'){
    const company = ev.payload.company ? await prisma.company.upsert({
      where: { name: ev.payload.company },
      update: { domain: ev.payload.domain ?? undefined },
      create: { name: ev.payload.company, domain: ev.payload.domain ?? null }
    }) : null;
    await prisma.contact.upsert({
      where: { email: ev.payload.email ?? `unknown+${Date.now()}@example` },
      update: { name: ev.payload.name ?? undefined, companyId: company?.id },
      create: { name: ev.payload.name ?? 'Unknown', email: ev.payload.email ?? null, companyId: company?.id ?? null }
    });
  } else if (ev.kind === 'deal'){
    const company = ev.payload.company ? await prisma.company.upsert({
      where: { name: ev.payload.company },
      update: {},
      create: { name: ev.payload.company }
    }) : null;
    await prisma.deal.create({
      data: {
        name: ev.payload.name ?? 'New Deal',
        amount: ev.payload.amount ?? null,
        stage: ev.payload.stage ?? 'Lead',
        companyId: company?.id ?? null,
        owner: 'auto@ingest'
      }
    });
  }
}

export async function runIngest(sources: IngestSource[]){
  const events = (await Promise.all(sources.map(s => s.pull()))).flat();
  for (const ev of events){ await handleEvent(ev); }
  return { processed: events.length };
}
