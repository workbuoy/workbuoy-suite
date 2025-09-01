/**
 * Ensures runConnector respects breaker and updates metrics without throwing.
 */
import { runConnector } from '../lib/connectors/index.js';
import { metrics } from '../lib/metrics/registry.js';

test('breaker skips connector', async () => {
  process.env.WB_BREAKER_OPEN = 'Salesforce';
  const r = await runConnector('Salesforce');
  expect(r.skipped).toBe(true);
});

test('metrics are available', async () => {
  const r = await runConnector('HubSpot');
  const out = await metrics();
  expect(typeof out).toBe('string');
});
