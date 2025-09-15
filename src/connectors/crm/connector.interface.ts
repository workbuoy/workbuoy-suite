// src/connectors/crm/connector.interface.ts
export interface CRMConnector {
  listContacts(): Promise<any[]>;
  upsertContact(c:any): Promise<void>;
}
