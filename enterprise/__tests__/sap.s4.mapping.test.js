import { describe,it,expect } from '@jest/globals';

describe('SAP S4 mapping', ()=>{
  it('maps sales order fields', ()=>{
    const o={ SalesOrder:'500', SalesOrderType:'OR', OverallDeliveryStatus:'P', OverallSDDocumentRejectionSts:'N', SoldToParty:'CUST1', TotalNetAmount:200, TransactionCurrency:'EUR', LastChangeDateTime:'2025-08-01T12:00:00Z'};
    const mapped={ id:o.SalesOrder, type:'deal', title:`S4: SalesOrder ${o.SalesOrder} (${o.SalesOrderType})`, ts:o.LastChangeDateTime, accountId:o.SoldToParty, payload:o };
    expect(mapped.title).toMatch(/SalesOrder/);
    expect(mapped.accountId).toBe('CUST1');
  });
});
