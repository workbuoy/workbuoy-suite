// src/connectors/crm/mock.connector.ts
import { CRMConnector } from './connector.interface';
export class MockCRMConnector implements CRMConnector {
  async listContacts(){ return [{id:'1', name:'Mock Contact'}]; }
  async upsertContact(_c:any){}
}
