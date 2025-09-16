import { listContacts, upsertContact, removeContact } from '../src/features/crm/crm.service';

test('crm repo roundtrip', async ()=>{
  const c = { id:'x', name:'X', email:'x@test' };
  await upsertContact(c);
  const all = await listContacts();
  expect(all.find(a=>a.id==='x')).toBeTruthy();
  await removeContact('x');
});
