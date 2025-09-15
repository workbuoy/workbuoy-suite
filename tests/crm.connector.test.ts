// tests/crm.connector.test.ts
import { getCrmConnector } from '../src/connectors/crm';
describe('CRM connector', () => {
  it('lists contacts', async () => {
    const c = getCrmConnector();
    const list = await c.listContacts();
    expect(Array.isArray(list)).toBe(true);
  });
});
