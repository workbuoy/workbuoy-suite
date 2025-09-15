import express from 'express';
import request from 'supertest';
import { manualCompleteRouter } from '../../src/routes/manual.complete';

jest.mock('../../src/core/intentLog', () => ({
  logIntent: async (_: any) => 'intent-1'
}));

describe('POST /api/manual-complete', () => {
  const app = express();
  app.use(express.json());
  app.use('/api', manualCompleteRouter());

  it('records manual completion and returns an id', async () => {
    const r = await request(app).post('/api/manual-complete').send({ capability: 'finance.invoice.send', note: 'sent via phone' }).expect(200);
    expect(r.body?.ok).toBe(true);
    expect(r.body?.intentId).toBe('intent-1');
  });
});
