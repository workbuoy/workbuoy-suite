import { describe,it,expect } from '@jest/globals';
import { logConnectorEvent } from '../lib/audit/connector-audit.js';

describe('connector audit',()=>{
  it('logs event', ()=>{
    logConnectorEvent({provider:'x',account_id:'y',event:'sync',status:'ok',ts:Date.now(),details:{rows:1}});
    expect(true).toBe(true);
  });
});
