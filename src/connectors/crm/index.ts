// src/connectors/crm/index.ts
import { MockCRMConnector } from './mock.connector';
export function getCRMConnector(){
  const kind = process.env.CRM_CONNECTOR || 'mock';
  switch(kind){
    case 'mock': default: return new MockCRMConnector();
  }
}
