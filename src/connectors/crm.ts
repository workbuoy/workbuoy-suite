
export interface CRMConnector {
  findCustomerByName(name:string): Promise<{ id:string; name:string }|undefined>;
  listDeals(customerId:string): Promise<Array<{ id:string; amount:number; stage:string }>>;
}
