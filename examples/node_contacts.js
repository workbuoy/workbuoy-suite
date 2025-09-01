import { WorkbuoyApi } from 'workbuoy-sdk';
const api = new WorkbuoyApi({ baseUrl: 'http://localhost:3000/api/v1' });

async function main() {
  const c = await api.createContact({ name: 'Alice', email: 'alice@example.com' });
  console.log('Created', c);
  const list = await api.listContacts({ limit: 10 });
  console.log('List', list.items);
}
main();
