// src/connectors/crm/index.ts
import { MockCrmConnector } from './mock.connector';
import { LocalCrmConnector } from './local.connector';
import type { CrmConnector } from './connector.interface';

export function getCrmConnector(): CrmConnector {
  const key = process.env.CRM_CONNECTOR || 'mock';
  switch (key) {
    case 'local': return new LocalCrmConnector();
    case 'mock': default: return new MockCrmConnector();
  }
}
