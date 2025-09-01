import { WorkBuoyClient } from '../sdk/js/dist/index.js';

const client = new WorkBuoyClient({ apiKey:'dev-123', tenantId:'demo' });

async function run() {
  const contacts = await client.listContacts();
  console.log('Contacts', contacts);
}
run();
