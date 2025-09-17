import request from 'supertest';
import os from 'os';
import path from 'path';
import express from 'express';
import { metaGenesisRouter } from '../../src/routes/genesis.autonomy';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(metaGenesisRouter());
  return app;
}

describe('genesis autonomy routes', () => {
  it('returns an introspection report with awareness score', async () => {
    const res = await request(buildApp()).get('/genesis/introspection-report');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.awarenessScore).toBe('number');
    expect(res.body.introspectionReport).toEqual(
      expect.objectContaining({
        generatedAt: expect.any(String),
        summary: expect.any(String),
        signals: expect.any(Array),
      }),
    );
  });

  it('rejects evolution implementation without manual approval token', async () => {
    const approvalPath = path.join(os.tmpdir(), `evolution-${Date.now()}`, 'APPROVED');
    process.env.EVOLUTION_APPROVAL_FILE = approvalPath;

    const res = await request(buildApp())
      .post('/genetics/implement-evolution')
      .send({ requestedBy: 'jest-suite' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: false,
        error: 'approval_required',
      }),
    );

    delete process.env.EVOLUTION_APPROVAL_FILE;
  });
});
