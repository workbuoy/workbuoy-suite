import { test, expect } from '@playwright/test';

test('meta evolution endpoint denies without approval token', async ({ request }) => {
  const response = await request.post('/genetics/implement-evolution', {
    data: { requestedBy: 'playwright' },
  });
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body.error).toBe('approval_required');
});
