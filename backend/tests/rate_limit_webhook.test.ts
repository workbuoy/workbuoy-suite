import express from 'express';
import request from 'supertest';
import { buildWebhookLimiter } from '../src/security/rateLimit';

describe('Rate limit webhook', () => {
  const app = express();
  process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS = '1000';
  process.env.RATE_LIMIT_WEBHOOK_MAX = '3';
  app.post('/api/v1/connectors/hubspot/webhook', buildWebhookLimiter(), (_req,res)=>res.json({ ok:true }));

  it('returns 429 after threshold', async () => {
    await request(app).post('/api/v1/connectors/hubspot/webhook');
    await request(app).post('/api/v1/connectors/hubspot/webhook');
    await request(app).post('/api/v1/connectors/hubspot/webhook');
    const r4 = await request(app).post('/api/v1/connectors/hubspot/webhook');
    expect(r4.status).toBe(429);
  });
});
