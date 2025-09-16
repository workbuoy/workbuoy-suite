import { CrmConnector } from './base';
import { MockCrmConnector } from './mock.connector';
import { LocalCrmConnector } from './local.connector';
import { HttpCrmConnector } from './http.connector';

export function getCrmConnector(): CrmConnector {
  const mode = process.env.CRM_CONNECTOR || 'mock';
  if (mode==='local') return new LocalCrmConnector();
  if (mode==='http') return new HttpCrmConnector(process.env.CRM_BASE||'http://localhost:4000');
  return new MockCrmConnector();
}
