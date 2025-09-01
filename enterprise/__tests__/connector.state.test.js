import { describe,it,expect } from '@jest/globals';
import { setState,getState } from '../lib/db/state.js';

describe('connector_state',()=>{
  it('can set and get state', async()=>{
    await setState('test','acc','lastSuccessfulSync','2025-08-01T00:00:00Z');
    const v=await getState('test','acc','lastSuccessfulSync');
    expect(v).toMatch(/2025/);
  });
});
