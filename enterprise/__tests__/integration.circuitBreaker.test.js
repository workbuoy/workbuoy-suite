
import { getBreaker } from '../lib/integration/circuitBreaker.js';

test('circuit opens after consecutive failures', ()=>{
  const cb = getBreaker('salesforce');
  for(let i=0;i<5;i++) cb.recordFailure();
  expect(cb.state).toBe('open');
});
