export interface CrmConnector {
  listContacts(): Promise<any[]>;
  upsertContact(c:any): Promise<any>;
  removeContact(id:string): Promise<boolean>;
}
