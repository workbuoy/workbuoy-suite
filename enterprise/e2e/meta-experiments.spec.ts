// e2e/meta-experiments.spec.ts
import { test, expect, request } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Meta Experiments E2E', () => {
  test('start -> stop', async ({ request }) => {
    const start = await request.post(`${BASE}/api/meta/experiments/start`, {
      data: {
        name: `e2e-${Date.now()}`,
        goal: 'validate flow',
        sla_target: { p95_latency_ms: 1500, error_rate_threshold: 0.05 }
      },
      headers: { 'content-type':'application/json' }
    });
    expect(start.ok()).toBeTruthy();
    const { id } = await start.json();
    const stop = await request.post(`${BASE}/api/meta/experiments/stop`, {
      data: { id },
      headers: { 'content-type':'application/json' }
    });
    expect(stop.ok()).toBeTruthy();
    const payload = await stop.json();
    expect(payload.outcome).toBeDefined();
    const metrics = await request.get(`${BASE}/api/meta/experiments/${id}/metrics`);
    expect(metrics.ok()).toBeTruthy();
  });
});
