import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const acme = await prisma.company.upsert({
    where: { domain: 'acme.io' },
    update: {},
    create: { name: 'Acme Inc', domain: 'acme.io' }
  });
  const contact = await prisma.contact.upsert({
    where: { email: 'ada@acme.io' },
    update: { name: 'Ada Lovelace' },
    create: { name: 'Ada Lovelace', email: 'ada@acme.io', companyId: acme.id }
  });
  const deal = await prisma.deal.create({
    data: { name: 'Acme Renewal', amount: 150000, stage: 'Negotiation', companyId: acme.id, owner: 'sales@workbuoy.dev' }
  });
  const ticket = await prisma.ticket.create({
    data: { subject: 'Onboarding help', status: 'open', requesterEmail: 'ada@acme.io', companyId: acme.id }
  });
  console.log('Seeded:', { company: acme.id, contact: contact.id, deal: deal.id, ticket: ticket.id });
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async ()=>{ await prisma.$disconnect(); });
