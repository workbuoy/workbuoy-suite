import { WorkBuoy } from '../../sdk/js/src';

async function run() {
  const client = new WorkBuoy({
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    apiKey: process.env.API_KEY || 'dev-123',
    tenantId: process.env.TENANT_ID || 'demo-tenant',
  });

  const { items } = await client.contacts.list({ limit: 5 });
  console.log('contacts', items.length);

  const created = await client.contacts.create({ tenant_id: client.tenantId, name: 'Alice Example' });
  console.log('created', created.id || created.name);
}

run().catch(err => { console.error(err); process.exit(1); });
