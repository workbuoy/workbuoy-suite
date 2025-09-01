import { test, expect } from '@playwright/test';

test('connectors sync returns status list and metrics include wb_connector_*', async ({ request }) => {
  const syncRes = await request.get('/api/connectors/sync');
  expect(syncRes.ok()).toBeTruthy();
  const body = await syncRes.json();
  expect(Array.isArray(body.status)).toBeTruthy();
  expect(body.status.length).toBeGreaterThan(0);
  expect(body.status.some(s => s.skipped === true || s.ok === true || s.error)).toBeTruthy();

  const metricsRes = await request.get('/api/metrics');
  expect(metricsRes.ok()).toBeTruthy();
  const text = await metricsRes.text();
  expect(text).toContain('wb_connector_sync_total');
  expect(text).toContain('wb_connector_err_total');
  expect(text).toContain('wb_connector_p95_ms');
});
