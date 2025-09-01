import { describe,it,expect } from '@jest/globals';
import { odataGetPaged } from '../lib/odata/client.js';

describe('odataGetPaged', ()=>{
  it('handles empty results', async()=>{
    const {results,pageCount}= await odataGetPaged({ baseUrl:'http://localhost', path:'', params:{}, auth:{}, pageSize=1, maxPages=1 });
    expect(Array.isArray(results)).toBe(true);
    expect(pageCount).toBe(0);
  });
});
