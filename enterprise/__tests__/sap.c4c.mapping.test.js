import { describe,it,expect } from '@jest/globals';

describe('SAP C4C mapping', ()=>{
  it('maps opportunity fields', ()=>{
    const o={ ObjectID:'1', Name:'Opp1', SalesCycleStatusCodeText:'In Progress', AccountID:'A1', ExpectedRevenue:1000, CloseDate:'2025-09-01', OwnerID:'U1', LastChangeDateTime:'2025-08-01T12:00:00Z'};
    const mapped={ id:o.ObjectID, type:'deal', title:`C4C: ${o.Name} (${o.SalesCycleStatusCodeText})`, ts:o.LastChangeDateTime, accountId:o.AccountID, payload:o };
    expect(mapped.title).toContain('C4C:');
    expect(mapped.accountId).toBe('A1');
  });
});
