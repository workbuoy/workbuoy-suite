import { getCrmConnector } from '../../src/connectors/crm';

describe('CRM connector contract', ()=>{
  it('supports list/upsert/remove', async ()=>{
    const c = getCrmConnector();
    await c.upsertContact({id:'c1', name:'Test'});
    const all = await c.listContacts();
    expect(Array.isArray(all)).toBe(true);
    await c.removeContact('c1');
  });
});
