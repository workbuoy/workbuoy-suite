
// tests/jest/integrations.test.js
import { CircuitBreaker } from '../../lib/integration/circuit-breaker.js';
import { IntegrationMonitoring } from '../../lib/integration/monitoring.js';

test('circuit opens after 5 failures', async () => {
  const cb = new CircuitBreaker('x', { failureThreshold: 5, resetTimeout: 10000 });
  const op = async () => { throw new Error('fail'); };
  await expect(cb.execute(op).catch(()=>null));
  await expect(cb.execute(op).catch(()=>null));
  await expect(cb.execute(op).catch(()=>null));
  await expect(cb.execute(op).catch(()=>null));
  await expect(cb.execute(op).catch(()=>null));
  expect(cb.state).toBe('OPEN');
});

test('monitoring produces health status', () => {
  const mon = new IntegrationMonitoring();
  for (let i=0;i<20;i++){ mon.recordMetric('sf','get',10,true); }
  for (let i=0;i<5;i++){ mon.recordMetric('sf','get',3000,false); }
  const status = mon.getHealthStatus();
  expect(status.sf).toBeTruthy();
});
