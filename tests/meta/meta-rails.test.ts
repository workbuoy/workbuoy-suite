import request from 'supertest';

import app from '../../src/server';

describe('META rails guard', () => {
  it('rejects evolution without approval token', async () => {
    const res = await request(app)
      .post('/genetics/implement-evolution')
      .send({ requestedBy: 'meta-rails-test' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual(expect.objectContaining({ error: 'approval_required' }));
  });
});
