import express from 'express';
import request from 'supertest';
import { financeReminderRouter } from '../../src/routes/finance.reminder';

// mock connector: not used (orchestrator uses template), but we attach to app for router to find it
const mockConnector = {
  health: async () => true,
  dryRun: async () => ({ valid: true }),
  simulate: async () => ({}),
  execute: async () => ({ status: 'noop' })
};

describe('POST /api/finance/reminder/suggest', () => {
  const app = express();
  app.use(express.json());
  app.set('financeConnector', mockConnector);
  app.use('/api/finance', financeReminderRouter());

  it('returns a draftEmail', async () => {
    const res = await request(app)
      .post('/api/finance/reminder/suggest')
      .send({ invoiceId: 'INV-1', customerEmail: 'a@b.com' })
      .expect(200);
    expect(res.body?.outcome?.draftEmail).toMatch(/faktura INV-1/);
  });
});
