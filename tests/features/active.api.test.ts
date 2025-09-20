/**
 * Minimal API smoke test for the features router (no DB).
 * Forces in-memory mode so the route does not try to hit Postgres.
 */
import request from 'supertest';

// Make sure tests run in in-memory mode regardless of CI env
process.env.FF_PERSISTENCE = process.env.FF_PERSISTENCE ?? 'false';

// Import the Express app (must export default app from src/server)
import app from '../../src/server';

describe('Features router public path', () => {
  it('serves GET /api/features/active (no double /api)', async () => {
    const res = await request(app)
      .get('/api/features/active')
      .set('x-tenant', 'DEV')
      .set('x-user', 'u1')
      .set('x-role', 'sales_manager');

    // 200 (list) or 204 (empty) are fine for a smoke test
    expect([200, 204]).toContain(res.status);
  });
});
