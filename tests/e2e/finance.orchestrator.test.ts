import request from 'supertest';
import app from '../../src/server'; // assumes PR4b exports app

describe('Finance Orchestrator dev routes', () => {
  it('POST /api/_dev/finance/prepareDraft returns previewUrl in simulate mode', async () => {
    const res = await request(app)
      .post('/api/_dev/finance/prepareDraft')
      .set('x-autonomy-level', '4')
      .send({ dealId: 'D-42' })
      .expect(200);
    expect(res.body?.outcome?.previewUrl).toMatch(/D-42/);
    // mode should be simulate at L4
    expect(res.body?.mode).toBe('simulate');
  });
});
