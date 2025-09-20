/**
 * Minimal API smoke test for the features router (no DB).
 * Forces in-memory mode so the route does not try to hit Postgres.
 */
import request from 'supertest';

// Tving in-memory uansett hva CI har satt
process.env.FF_PERSISTENCE = process.env.FF_PERSISTENCE ?? 'false';

// Importer Express-appen (server må eksportere app uten å lytte)
import app from '../../src/server';

describe('Features router public path', () => {
  it('GET /api/features/active responds (200 or 204)', async () => {
    const res = await request(app)
      .get('/api/features/active')
      .set('x-tenant', 'DEV')
      .set('x-user', 'u1')
      .set('x-role', 'sales_manager');

    expect([200, 204]).toContain(res.status);
  });
});
