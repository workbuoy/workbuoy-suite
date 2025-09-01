import { test, expect } from '@playwright/test';
import http from 'http';
import app from '../../examples/server';

let server: http.Server;
const PORT = 4444;
const baseURL = `http://localhost:${PORT}`;

test.beforeAll(async () => {
  server = app.listen(PORT);
});

test.afterAll(async () => {
  await new Promise(res => server.close(res));
});

test('access flow', async ({ request }) => {
  const res = await request.post(`${baseURL}/api/secure/dsr/access`, {
    data: { user_email: 'e2e@example.com' }
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.export).toBeTruthy();
});

test('erasure flow', async ({ request }) => {
  const res = await request.post(`${baseURL}/api/secure/dsr/erasure`, {
    data: { user_email: 'e2e@example.com' }
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.status).toBe('soft-deleted');
});
