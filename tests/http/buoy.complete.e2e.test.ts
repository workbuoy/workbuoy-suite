import request from 'supertest';
import app from '../../src/server';

// Mock runCapability to avoid executing real actions
jest.mock('../../src/core/capabilityRunner', () => ({
  runCapability: async () => ({ outcome: { ok: true }, policy: { allowed: true, explanation: 'ok' } })
}));

describe('POST /buoy/complete', () => {
  it('returns explanations[] and result when allowed', async () => {
    const r = await request(app)
      .post('/buoy/complete')
      .set('x-autonomy-level', '4')
      .send({ text: 'lag faktura utkast' })
      .expect(200);
    expect(Array.isArray(r.body?.explanations)).toBe(true);
    expect(r.body?.result?.ok).toBe(true);
  });
});
