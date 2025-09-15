
import type { CRMConnector } from './crm';
export const MockCRM: CRMConnector = {
  async findCustomerByName(name){ return { id:'C1', name }; },
  async listDeals(){ return [{ id:'D1', amount: 120000, stage:'Closed Won' }]; }
};
